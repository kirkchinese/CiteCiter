/** Reader panel controller: document library browsing, import, selection, and Topic creation. */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-runtime/client'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type {
  CiteCiterRequest,
  CiteCiterResponse,
  DocumentContent,
  DocumentFormat,
  DocumentSummary,
} from '../topic.ts'
import type { CompanionFace } from './companion-controller.ts'
import type { ReaderSelection } from './reader-selection.ts'

export type ReaderDocumentsStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface ReaderSnapshot {
  open: boolean
  documents: readonly DocumentSummary[]
  documentsStatus: ReaderDocumentsStatus
  active: DocumentContent | null
  selection: ReaderSelection | null
  question: string
  creating: boolean
  error: string | null
}

export interface ReaderFace {
  getSnapshot(): ReaderSnapshot
  subscribe(listener: () => void): () => void
  setOpen(open: boolean): void
  refresh(): Promise<void>
  importFile(name: string, content: string): Promise<DocumentSummary | null>
  openDocument(documentId: string): Promise<void>
  setSelection(selection: ReaderSelection | null): void
  setQuestion(question: string): void
  createTopic(): Promise<void>
  dispose(): Promise<void>
}

type RemoteRequest = (
  request: CiteCiterRequest,
  signal: AbortSignal,
) => Promise<RemoteResult<CiteCiterResponse>>

/** Initial Reader snapshot. */
export function createInitialReaderSnapshot(): ReaderSnapshot {
  return {
    open: false,
    documents: [],
    documentsStatus: 'idle',
    active: null,
    selection: null,
    question: '',
    creating: false,
    error: null,
  }
}

function remoteValue(result: RemoteResult<CiteCiterResponse>): CiteCiterResponse {
  if (!result.ok) throw new Error(result.error.message)
  return result.value
}

function formatFromName(name: string): DocumentFormat {
  return /\.(md|markdown)$/iu.test(name) ? 'markdown' : 'text'
}

/** Bind the Reader store to the CiteCiter Remote and the companion Topic creator. */
export function createReaderController(
  request: RemoteRequest,
  companion: CompanionFace,
  store = createSnapshotStore(createInitialReaderSnapshot()),
): ReaderFace {
  let disposed = false
  const lifecycle = new AbortController()
  const operations = new Set<Promise<unknown>>()

  const update = (mutator: (draft: ReaderSnapshot) => void) => {
    if (!disposed) store.update(mutator)
  }
  const fail = (error: unknown) => {
    if (disposed) return
    update((draft) => {
      draft.error = error instanceof Error ? error.message : String(error)
      draft.creating = false
    })
  }
  const call = (command: CiteCiterRequest): Promise<CiteCiterResponse> => {
    const operation = (async () => {
      lifecycle.signal.throwIfAborted()
      const result = await request(command, lifecycle.signal)
      lifecycle.signal.throwIfAborted()
      return remoteValue(result)
    })()
    operations.add(operation)
    void operation.finally(() => operations.delete(operation))
    return operation
  }

  const refresh = async () => {
    if (disposed) return
    update((draft) => {
      draft.documentsStatus = 'loading'
      draft.error = null
    })
    try {
      const response = await call({ action: 'documents' })
      if (response.kind !== 'documents') throw new Error('CiteCiter 返回了错误的文档列表响应')
      update((draft) => {
        draft.documents = response.documents
        draft.documentsStatus = 'ready'
      })
    } catch (error) {
      if (!disposed) update((draft) => {
        draft.documentsStatus = 'error'
        draft.error = error instanceof Error ? error.message : String(error)
      })
    }
  }

  const setOpen = (open: boolean) => {
    if (disposed || store.getSnapshot().open === open) return
    update((draft) => {
      draft.open = open
      draft.error = null
    })
    if (open) void refresh()
  }

  const importFile = async (name: string, content: string): Promise<DocumentSummary | null> => {
    if (disposed) return null
    try {
      const title = name.trim() === '' ? '未命名文档' : name.trim()
      const response = await call({
        action: 'document-import',
        title,
        format: formatFromName(name),
        content,
      })
      if (response.kind !== 'document') throw new Error('CiteCiter 返回了错误的文档导入响应')
      await refresh()
      return response.document
    } catch (error) {
      fail(error)
      return null
    }
  }

  const openDocument = async (documentId: string) => {
    if (disposed) return
    update((draft) => {
      draft.active = null
      draft.selection = null
      draft.question = ''
      draft.error = null
    })
    try {
      const response = await call({ action: 'document-get', documentId })
      if (response.kind !== 'document-content') throw new Error('CiteCiter 返回了错误的文档内容响应')
      update((draft) => {
        draft.active = response.document
      })
    } catch (error) {
      fail(error)
    }
  }

  const createTopic = async () => {
    if (disposed) return
    const snapshot = store.getSnapshot()
    const selection = snapshot.selection
    const question = snapshot.question.trim()
    if (snapshot.active === null || selection === null) {
      fail(new Error('请先在文档中选择一段内容'))
      return
    }
    if (question === '') {
      fail(new Error('请输入要问 CiteCiter 的问题'))
      return
    }
    update((draft) => {
      draft.creating = true
      draft.error = null
    })
    try {
      await companion.createFromDocument({
        documentId: snapshot.active.documentId,
        displayText: selection.displayText,
        prefixText: selection.prefixText,
        suffixText: selection.suffixText,
      }, question)
      update((draft) => {
        draft.creating = false
        draft.selection = null
        draft.question = ''
      })
    } catch (error) {
      fail(error)
    }
  }

  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    setOpen,
    refresh,
    importFile,
    openDocument,
    setSelection: (selection) => {
      if (disposed) return
      update((draft) => {
        draft.selection = selection
      })
    },
    setQuestion: (question) => {
      if (disposed) return
      update((draft) => {
        draft.question = question
      })
    },
    createTopic,
    dispose: async () => {
      if (disposed) return
      disposed = true
      lifecycle.abort(new DOMException('CiteCiter is shutting down', 'AbortError'))
      while (operations.size > 0) await Promise.allSettled([...operations])
    },
  }
}
