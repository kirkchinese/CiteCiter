import {
  createSnapshotStore,
  type ChatConversationViewNode,
  type ISessions,
  type SessionFace,
  type SessionId,
  type SnapshotStore,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { CiteSelection } from './types.ts'
import { buildPrompt, parseAnchorSeq } from './prompt.ts'

export type ExplainPhase = 'idle' | 'creating' | 'ready' | 'running' | 'settled' | 'error'

export interface ExplainSnapshot {
  phase: ExplainPhase
  childId: SessionId | null
  selection: CiteSelection | null
  answerText: string | null
  error: string | null
  permissionWarning: string | null
}

export interface ExplainFace {
  getSnapshot(): ExplainSnapshot
  subscribe(listener: () => void): () => void
  start(selection: CiteSelection): Promise<void>
  stop(): Promise<void>
}

/** The `ISession` surface omits `open()`, which concrete Session implements (D8). */
type OpenableSession = SessionFace & {
  open(): Promise<void>
}

const EMPTY: ExplainSnapshot = {
  phase: 'idle',
  childId: null,
  selection: null,
  answerText: null,
  error: null,
  permissionWarning: null,
}

/** Create the explainer runtime owned by one plugin fiber. */
export function createExplainer(sessions: ISessions): ExplainFace {
  const store: SnapshotStore<ExplainSnapshot> = createSnapshotStore(EMPTY)
  let child: OpenableSession | null = null
  let unsubscribeChild: (() => void) | null = null
  const baselineAssistantKeys = new Set<string>()

  const update = (mutator: (draft: ExplainSnapshot) => void) => {
    store.update(mutator)
  }

  const fail = (error: unknown, phase: ExplainPhase = 'error') => {
    update((draft) => {
      draft.phase = phase
      draft.error = error instanceof Error ? error.message : String(error)
    })
  }

  const updateFromChild = () => {
    const session = child
    if (session === null) return
    const snapshot = session.getSnapshot()
    let answer: { key: string; text: string } | null = null
    for (const node of snapshot.chat.nodes.values()) {
      if (node.kind !== 'assistant-step' || baselineAssistantKeys.has(node.key)) continue
      const text = settledAssistantText(node)
      if (text !== null && (answer === null || node.anchorSeq >= latestAnchor(answer, snapshot))) {
        answer = { key: node.key, text }
      }
    }
    if (answer !== null) {
      update((draft) => {
        draft.phase = 'settled'
        draft.answerText = answer.text
        draft.error = null
      })
      return
    }
    if (snapshot.promptError !== null) {
      update((draft) => {
        draft.phase = 'error'
        draft.error = snapshot.promptError?.error.message ?? 'prompt rejected'
      })
      return
    }
    if (snapshot.lastAgentError !== null) {
      update((draft) => {
        draft.phase = 'error'
        draft.error = snapshot.lastAgentError
      })
      return
    }
    update((draft) => {
      draft.phase = snapshot.running ? 'running' : draft.phase
    })
  }

  const attachChild = (session: OpenableSession) => {
    child = session
    unsubscribeChild?.()
    unsubscribeChild = session.subscribe(updateFromChild)
    for (const node of session.getSnapshot().chat.nodes.values()) {
      if (node.kind === 'assistant-step') baselineAssistantKeys.add(node.key)
    }
  }

  const prompt = async (selection: CiteSelection) => {
    const session = child
    if (session === null) return
    const result = await session.prompt([{
      type: 'text' as const,
      text: buildPrompt(selection),
    }], 'queue')
    if (!result.ok) {
      fail(result.error.message)
      return
    }
    update((draft) => {
      draft.phase = 'running'
      draft.selection = selection
      draft.answerText = null
      draft.error = null
    })
    updateFromChild()
  }

  const start = async (selection: CiteSelection) => {
    update((draft) => {
      draft.selection = selection
      draft.error = null
    })
    if (child !== null) {
      await prompt(selection)
      return
    }
    const current = sessions.list.getSnapshot().current
    if (current === undefined) {
      fail('no current session')
      return
    }
    const atSeq = parseAnchorSeq(selection.anchorKey)
    if (atSeq === null) {
      fail(`cannot derive fork seq from anchor "${selection.anchorKey}"`)
      return
    }
    update((draft) => {
      draft.phase = 'creating'
      draft.permissionWarning = null
    })
    let childId: SessionId
    try {
      childId = await sessions.fork({ sessionId: current, atSeq })
    } catch (error) {
      fail(error)
      return
    }
    const binding = sessions.binding(childId)
    if (binding === undefined) {
      fail(`fork child "${childId}" is not locally addressable`)
      return
    }
    const session = binding.session as OpenableSession
    try {
      await session.open()
    } catch (error) {
      fail(error)
      return
    }
    attachChild(session)
    update((draft) => {
      draft.childId = childId
      draft.phase = 'ready'
    })
    const permission = await session.command('/permission read-only')
    if (!permission.ok) {
      update((draft) => {
        draft.permissionWarning = `read-only switch failed: ${permission.error.message}`
      })
    }
    await prompt(selection)
  }

  const stop = async () => {
    const session = child
    if (session === null) return
    await session.cancel()
    update((draft) => {
      draft.phase = 'ready'
    })
  }

  return {
    getSnapshot: () => store.getSnapshot(),
    subscribe: (listener) => store.subscribe(listener),
    start,
    stop,
  }
}

/** Extract the concatenated text of a settled assistant-step chat node. */
function settledAssistantText(node: ChatConversationViewNode): string | null {
  const data = node.data as { status?: unknown; blocks?: readonly unknown[] } | null
  if (data === null || typeof data !== 'object') return null
  if (data.status !== 'settled') return null
  let text = ''
  for (const block of data.blocks ?? []) {
    if (typeof block !== 'object' || block === null) continue
    const record = block as { kind?: unknown; text?: unknown }
    if (record.kind === 'text' && typeof record.text === 'string') text += record.text
  }
  return text
}

function latestAnchor(candidate: { key: string }, snapshot: { chat: { nodes: { get(key: string): ChatConversationViewNode | undefined } } }): number {
  return snapshot.chat.nodes.get(candidate.key)?.anchorSeq ?? -1
}
