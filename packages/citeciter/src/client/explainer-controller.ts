import type {
  ISessions,
  IWorkspaces,
  SessionFace,
  SessionId,
  SnapshotStore,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { PrepareThreadResult } from '../index.ts'
import type { CiteCiterProjection, CitationRecord } from '../thread.ts'
import { readAssistantAnswer } from './answer.ts'
import { normalizeQuestion } from './prompt.ts'
import {
  createCitation,
  findCitationThread,
  listCitationThreads,
  summarizeCitationThread,
  type ThreadSummary,
} from './thread.ts'
import { extractTranscript, type TranscriptEntry } from './transcript.ts'
import type { CiteSelection } from './types.ts'

export type ExplainPhase = 'idle' | 'draft' | 'creating' | 'ready' | 'running' | 'error'

export interface ExplainSnapshot {
  phase: ExplainPhase
  selection: CiteSelection | null
  activeThread: ThreadSummary | null
  threads: readonly ThreadSummary[]
  transcript: readonly TranscriptEntry[]
  error: string | null
}

export type PrepareThread = (
  sessionId: SessionId,
  citation: CitationRecord,
) => Promise<RemoteResult<PrepareThreadResult>>

export interface ExplainFace {
  getSnapshot(): ExplainSnapshot
  subscribe(listener: () => void): () => void
  select(selection: CiteSelection): void
  ask(question: string): Promise<void>
  switchThread(sessionId: string): Promise<void>
  renameActive(title: string): Promise<void>
  archiveActive(): Promise<void>
  stop(): Promise<void>
  dispose(): Promise<void>
}

/**
 * The concrete binding session implements idempotent history hydration, but DSH
 * omits `open()` from its outward feature contract. CiteCiter uses this narrow
 * capability so a child can hydrate without `sessions.open(id)` navigating the
 * main GUI away from the source session.
 */
type OpenableSession = SessionFace & {
  open(): Promise<void>
}

/** Bind durable Thread orchestration to plugin-owned browser services and state. */
export function createExplainerController(
  sessions: ISessions,
  workspaces: IWorkspaces,
  prepareThread: PrepareThread,
  store: SnapshotStore<ExplainSnapshot>,
): ExplainFace {
  let child: OpenableSession | null = null
  let unsubscribeChild: (() => void) | null = null
  let unsubscribeProjection: (() => void) | null = null
  let disposed = false
  let epoch = 0
  let operationQueue = Promise.resolve()

  const isActive = (operationEpoch: number) => !disposed && operationEpoch === epoch
  const update = (mutator: (draft: ExplainSnapshot) => void) => {
    if (!disposed) store.update(mutator)
  }
  const fail = (error: unknown, operationEpoch = epoch) => {
    if (!isActive(operationEpoch)) return
    update((draft) => {
      draft.phase = 'error'
      draft.error = error instanceof Error ? error.message : String(error)
    })
  }

  const releaseAttachment = () => {
    unsubscribeProjection?.()
    unsubscribeProjection = null
    unsubscribeChild?.()
    unsubscribeChild = null
    child = null
  }

  const currentProjectedThread = (): CiteCiterProjection['thread'] | null => {
    if (child === null) return null
    const value = child.projections.faceOf('citeciter').getSnapshot() as CiteCiterProjection | undefined
    return value?.thread ?? null
  }

  const updateFromChild = () => {
    const session = child
    if (session === null || disposed) return
    const conversation = session.getSnapshot()
    const projected = currentProjectedThread()
    let activeThread = store.getSnapshot().activeThread
    if (projected !== null) {
      const summary = summarizeCitationThread(sessions.list.getSnapshot(), session.sessionId, projected)
      if (summary !== null) activeThread = summary
    }
    const historyStartSeq = activeThread?.historyStartSeq ?? Number.MAX_SAFE_INTEGER
    update((draft) => {
      draft.activeThread = activeThread
      draft.transcript = extractTranscript(conversation, historyStartSeq)
      if (conversation.promptError !== null) {
        draft.phase = 'error'
        draft.error = conversation.promptError.error.message
      } else if (conversation.lastAgentError !== null) {
        draft.phase = 'error'
        draft.error = conversation.lastAgentError
      } else if (conversation.running) {
        draft.phase = 'running'
        draft.error = null
      } else if (draft.phase !== 'creating' && draft.phase !== 'error') {
        draft.phase = 'ready'
      }
    })
  }

  const attach = (session: OpenableSession, summary: ThreadSummary) => {
    releaseAttachment()
    child = session
    update((draft) => {
      draft.selection = null
      draft.activeThread = summary
      draft.transcript = []
      draft.error = null
    })
    unsubscribeChild = session.subscribe(updateFromChild)
    const projectionFace = session.projections.faceOf('citeciter')
    unsubscribeProjection = projectionFace.subscribe(updateFromChild)
    updateFromChild()
  }

  const discoverThreads = () => listCitationThreads(
    sessions.list.getSnapshot(),
    workspaces.list.getSnapshot().archivedSessionIds,
  )

  const refreshThreads = () => {
    if (disposed) return
    const threads = discoverThreads()
    const activeId = store.getSnapshot().activeThread?.sessionId
    const refreshed = activeId === undefined
      ? undefined
      : threads.find((thread) => thread.sessionId === activeId)
    update((draft) => {
      draft.threads = threads
      if (refreshed !== undefined) draft.activeThread = refreshed
    })
  }
  const unsubscribeList = sessions.list.subscribe(refreshThreads)
  const unsubscribeWorkspaces = workspaces.list.subscribe(refreshThreads)
  refreshThreads()

  const ensureReadOnlyScope = async (
    session: OpenableSession,
    citation: CitationRecord,
    operationEpoch: number,
  ): Promise<boolean> => {
    let permission
    try {
      permission = await session.command('/permission read-only')
    } catch (error) {
      fail(error, operationEpoch)
      return false
    }
    if (!isActive(operationEpoch)) return false
    if (!permission.ok) {
      fail(`read-only switch failed: ${permission.error.message}`, operationEpoch)
      return false
    }
    if (!permission.value.matched) {
      fail('read-only switch failed: permission command was not recognized', operationEpoch)
      return false
    }

    let prepared
    try {
      prepared = await prepareThread(session.sessionId, citation)
    } catch (error) {
      fail(error, operationEpoch)
      return false
    }
    if (!isActive(operationEpoch)) return false
    if (!prepared.ok) {
      fail(`Citation Thread preparation failed: ${prepared.error.message}`, operationEpoch)
      return false
    }
    return true
  }

  const sendQuestion = async (
    session: OpenableSession,
    citation: CitationRecord,
    question: string,
    operationEpoch: number,
  ) => {
    if (!await ensureReadOnlyScope(session, citation, operationEpoch)) return
    if (!isActive(operationEpoch)) return
    update((draft) => {
      draft.phase = 'running'
      draft.error = null
    })
    let result
    try {
      result = await session.prompt([{ type: 'text', text: question }], 'queue')
    } catch (error) {
      fail(error, operationEpoch)
      return
    }
    if (!isActive(operationEpoch)) return
    if (!result.ok) {
      fail(result.error.message, operationEpoch)
      return
    }
    updateFromChild()
  }

  const openExisting = async (summary: ThreadSummary, operationEpoch: number): Promise<OpenableSession | null> => {
    const binding = sessions.binding(summary.sessionId)
    if (binding === undefined) {
      fail(`Citation Thread "${summary.sessionId}" is not locally addressable`, operationEpoch)
      return null
    }
    const session = binding.session as OpenableSession
    try {
      await session.open()
    } catch (error) {
      fail(error, operationEpoch)
      return null
    }
    if (!isActive(operationEpoch)) return null
    attach(session, summary)
    update((draft) => {
      draft.phase = session.getSnapshot().running ? 'running' : 'ready'
    })
    return session
  }

  const createForSelection = async (
    selection: CiteSelection,
    question: string,
    operationEpoch: number,
  ) => {
    const sourceBinding = sessions.binding(selection.sourceSessionId)
    if (sourceBinding === undefined) {
      fail(`source session "${selection.sourceSessionId}" is not locally addressable`, operationEpoch)
      return
    }
    const sourceNode = sourceBinding.session.getSnapshot().chat.nodes.get(selection.anchorKey)
    if (sourceNode === undefined || sourceNode.kind !== 'assistant-step') {
      fail('selected assistant context is no longer available', operationEpoch)
      return
    }
    const sourceAnswer = readAssistantAnswer(sourceNode.data)
    if (sourceAnswer === null || sourceAnswer.status === 'running') {
      fail('selected assistant response is not complete', operationEpoch)
      return
    }
    if (sourceNode.location.kind !== 'step' || sourceNode.location.turn.status !== 'closed') {
      fail('selected assistant turn is not complete', operationEpoch)
      return
    }

    let citation: CitationRecord
    try {
      citation = await createCitation(selection, selection.sourceSessionId, sourceNode.anchorSeq)
    } catch (error) {
      fail(error, operationEpoch)
      return
    }
    if (!isActive(operationEpoch)) return

    const existing = findCitationThread(discoverThreads(), citation)
    if (existing !== undefined) {
      const session = await openExisting(existing, operationEpoch)
      if (session !== null) await sendQuestion(session, existing.citation, question, operationEpoch)
      return
    }

    update((draft) => {
      draft.phase = 'creating'
      draft.error = null
    })
    let childId: SessionId
    try {
      childId = await sessions.fork({
        sessionId: selection.sourceSessionId,
        atSeq: sourceNode.anchorSeq,
      })
    } catch (error) {
      fail(error, operationEpoch)
      return
    }
    if (!isActive(operationEpoch)) return
    const binding = sessions.binding(childId)
    if (binding === undefined) {
      fail(`fork child "${childId}" is not locally addressable`, operationEpoch)
      return
    }
    const session = binding.session as OpenableSession
    try {
      await session.open()
    } catch (error) {
      fail(error, operationEpoch)
      return
    }
    if (!isActive(operationEpoch)) return

    const list = sessions.list.getSnapshot()
    const source = list.byId[selection.sourceSessionId]
    const childRow = list.byId[childId]
    const provisional: ThreadSummary = {
      sessionId: childId,
      parentSessionId: selection.sourceSessionId,
      parentTitle: source?.displayTitle ?? selection.sourceSessionId,
      ...(childRow?.title === undefined ? {} : { title: childRow.title }),
      updatedAt: childRow?.updatedAt ?? Date.now(),
      running: false,
      citation,
      historyStartSeq: Number.MAX_SAFE_INTEGER,
      contextSeq: Number.MAX_SAFE_INTEGER,
    }
    attach(session, provisional)
    await sendQuestion(session, citation, question, operationEpoch)
  }

  const enqueue = (task: (operationEpoch: number) => Promise<void>, operationEpoch = epoch): Promise<void> => {
    if (disposed) return Promise.resolve()
    const run = async () => {
      if (!isActive(operationEpoch)) return
      try {
        await task(operationEpoch)
      } catch (error) {
        fail(error, operationEpoch)
      }
    }
    const next = operationQueue.then(run, run)
    operationQueue = next
    return next
  }

  const select = (selection: CiteSelection) => {
    if (disposed) return
    epoch++
    releaseAttachment()
    update((draft) => {
      draft.phase = 'draft'
      draft.selection = selection
      draft.activeThread = null
      draft.transcript = []
      draft.error = null
    })
  }

  const ask = (rawQuestion: string) => {
    let question: string
    try {
      question = normalizeQuestion(rawQuestion)
    } catch (error) {
      fail(error)
      return Promise.resolve()
    }
    return enqueue(async (operationEpoch) => {
      const snapshot = store.getSnapshot()
      const session = child
      if (session !== null && snapshot.activeThread !== null) {
        await sendQuestion(session, snapshot.activeThread.citation, question, operationEpoch)
        return
      }
      if (snapshot.selection === null) {
        fail('select a quotation or recover a Citation Thread first', operationEpoch)
        return
      }
      await createForSelection(snapshot.selection, question, operationEpoch)
    })
  }

  const switchThread = (sessionId: string) => {
    if (disposed) return Promise.resolve()
    epoch++
    const operationEpoch = epoch
    releaseAttachment()
    update((draft) => {
      draft.phase = 'creating'
      draft.selection = null
      draft.activeThread = null
      draft.transcript = []
      draft.error = null
    })
    return enqueue(async () => {
      const summary = discoverThreads()
        .find((thread) => thread.sessionId === sessionId)
      if (summary === undefined) {
        fail(`Citation Thread "${sessionId}" is unavailable`, operationEpoch)
        return
      }
      await openExisting(summary, operationEpoch)
    }, operationEpoch)
  }

  const renameActive = (rawTitle: string) => enqueue(async (operationEpoch) => {
    const title = rawTitle.trim()
    if (title === '') {
      fail('Thread title cannot be empty', operationEpoch)
      return
    }
    const session = child
    if (session === null) {
      fail('no active Citation Thread', operationEpoch)
      return
    }
    const result = await session.rename(title)
    if (!isActive(operationEpoch)) return
    if (!result.ok) {
      fail(result.error.message, operationEpoch)
      return
    }
    update((draft) => {
      if (draft.activeThread !== null) draft.activeThread = { ...draft.activeThread, title: result.value.title }
      draft.error = null
    })
  })

  const archiveActive = () => {
    const session = child
    const summary = store.getSnapshot().activeThread
    if (disposed || session === null || summary === null) {
      fail('no active Citation Thread')
      return Promise.resolve()
    }
    const operationEpoch = epoch
    return enqueue(async () => {
      if (session.getSnapshot().running) {
        const cancelled = await session.cancel()
        if (!isActive(operationEpoch)) return
        if (!cancelled.ok) {
          fail(cancelled.error.message, operationEpoch)
          return
        }
      }
      await workspaces.archiveSession(summary.sessionId)
      if (!isActive(operationEpoch)) return

      // Only clear the visible Thread after the durable archive succeeds, so a
      // cancellation or workspace error stays actionable in the current panel.
      epoch++
      releaseAttachment()
      update((draft) => {
        draft.phase = 'idle'
        draft.selection = null
        draft.activeThread = null
        draft.transcript = []
        draft.error = null
      })
      refreshThreads()
    }, operationEpoch)
  }

  const stop = () => enqueue(async (operationEpoch) => {
    const session = child
    if (session === null) return
    const result = await session.cancel()
    if (!isActive(operationEpoch)) return
    if (!result.ok) {
      fail(result.error.message, operationEpoch)
      return
    }
    update((draft) => {
      draft.phase = 'ready'
      draft.error = null
    })
  })

  const dispose = async () => {
    if (disposed) return
    const session = child
    disposed = true
    epoch++
    unsubscribeList()
    unsubscribeWorkspaces()
    releaseAttachment()
    if (session?.getSnapshot().running === true) {
      try {
        await session.cancel()
      } catch {
        // Plugin unload is best-effort after the epoch has prevented stale writes.
      }
    }
    await operationQueue
  }

  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    select,
    ask,
    switchThread,
    renameActive,
    archiveActive,
    stop,
    dispose,
  }
}

export type { ThreadSummary, TranscriptEntry }
