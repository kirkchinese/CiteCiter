/** Citer's document library in the browser: the list, imports, deletion and full-text loading. */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol'
import type { CiteCiterRequest, CiteCiterResponse, DocumentFormat, DocumentSummary } from '../topic.ts'
import { t } from './i18n.ts'

export type DocumentLibraryStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface DocumentLibrarySnapshot {
  readonly documents: readonly DocumentSummary[]
  readonly status: DocumentLibraryStatus
  readonly error: string | null
  readonly importing: boolean
  /** Documents deleted in this window; their open views close. */
  readonly deleted: readonly string[]
}

/** One document's complete text, assembled from its pages. */
export interface LoadedDocument {
  readonly documentId: string
  readonly title: string
  readonly format: DocumentFormat
  readonly content: string
}

export interface DocumentLibraryFace {
  getSnapshot(): DocumentLibrarySnapshot
  subscribe(listener: () => void): () => void
  refresh(): Promise<void>
  /** Save text into the library. Throws when the Host refuses it. */
  importText(title: string, content: string): Promise<DocumentSummary>
  /** Read a local file and save it; failures show in the library snapshot. */
  importFile(file: Pick<File, 'name' | 'size' | 'text'>): Promise<DocumentSummary | null>
  remove(documentId: string): Promise<void>
  /** The whole document, loaded once per document and shared by every view of it. */
  load(documentId: string): Promise<LoadedDocument>
  /** A known title, for tab chips opened before the document loads. */
  title(documentId: string): string | undefined
  dispose(): Promise<void>
}

type RemoteRequest = (request: CiteCiterRequest, signal: AbortSignal) => Promise<RemoteResult<CiteCiterResponse>>

/** Largest local file Citer imports, before decoding. */
const MAX_FILE_BYTES = 8 * 1024 * 1024
/** Largest document text, in UTF-16 code units; matches the Host's import limit. */
const MAX_TEXT_LENGTH = 2_000_000

export const INITIAL_DOCUMENT_LIBRARY: DocumentLibrarySnapshot = { documents: [], status: 'idle', error: null, importing: false, deleted: [] }

function formatFromName(name: string): DocumentFormat {
  return /\.(md|markdown)$/iu.test(name) ? 'markdown' : 'text'
}

/** Bind the library to the Citer Remote. */
export function createDocumentLibrary(request: RemoteRequest, store = createSnapshotStore(INITIAL_DOCUMENT_LIBRARY)): DocumentLibraryFace {
  let disposed = false
  const lifecycle = new AbortController()
  const operations = new Set<Promise<unknown>>()
  const loads = new Map<string, Promise<LoadedDocument>>()
  const titles = new Map<string, string>()
  let refreshGeneration = 0

  const update = (mutator: (draft: { -readonly [K in keyof DocumentLibrarySnapshot]: DocumentLibrarySnapshot[K] }) => void) => {
    if (!disposed) store.update(mutator)
  }
  const call = (command: CiteCiterRequest): Promise<CiteCiterResponse> => {
    const operation = (async () => {
      lifecycle.signal.throwIfAborted()
      const result = await request(command, lifecycle.signal)
      lifecycle.signal.throwIfAborted()
      if (!result.ok) throw new Error(result.error.message)
      return result.value
    })().finally(() => operations.delete(operation))
    operations.add(operation)
    return operation
  }
  const accept = (documents: readonly DocumentSummary[]) => {
    for (const document of documents) titles.set(document.documentId, document.title)
    update((draft) => {
      draft.documents = documents
      draft.status = 'ready'
      draft.error = null
    })
  }

  const refresh = async () => {
    if (disposed) return
    const generation = ++refreshGeneration
    update((draft) => { draft.status = draft.status === 'ready' ? 'ready' : 'loading' })
    try {
      const response = await call({ action: 'documents' })
      if (generation !== refreshGeneration) return
      if (response.kind !== 'documents') throw new Error(t('settings.error.readerList'))
      accept(response.documents)
    } catch (error) {
      if (!disposed && generation === refreshGeneration) update((draft) => {
        draft.status = 'error'
        draft.error = error instanceof Error ? error.message : String(error)
      })
    }
  }

  const importText = async (title: string, content: string): Promise<DocumentSummary> => {
    const name = title.trim() === '' ? t('settings.error.untitled') : title.trim()
    const response = await call({ action: 'document-import', title: name.slice(0, 200), format: formatFromName(name), content })
    if (response.kind !== 'document') throw new Error(t('settings.error.readerImport'))
    titles.set(response.document.documentId, response.document.title)
    void refresh()
    return response.document
  }

  const importFile = async (file: Pick<File, 'name' | 'size' | 'text'>): Promise<DocumentSummary | null> => {
    if (disposed || store.getSnapshot().importing) return null
    update((draft) => { draft.importing = true; draft.error = null })
    try {
      if (file.size > MAX_FILE_BYTES) throw new Error(t('settings.error.fileTooLarge'))
      const content = await file.text()
      if (content.length > MAX_TEXT_LENGTH) throw new Error(t('settings.error.textTooLarge'))
      if (content.trim() === '') throw new Error(t('settings.reader.emptyFile'))
      return await importText(file.name, content)
    } catch (error) {
      update((draft) => { draft.error = error instanceof Error ? error.message : String(error) })
      return null
    } finally {
      update((draft) => { draft.importing = false })
    }
  }

  const remove = async (documentId: string) => {
    if (disposed) return
    try {
      const response = await call({ action: 'document-delete', documentId })
      if (response.kind !== 'documents') throw new Error(t('settings.error.readerList'))
      loads.delete(documentId)
      accept(response.documents)
      update((draft) => { draft.deleted = [...draft.deleted, documentId] })
    } catch (error) {
      update((draft) => { draft.error = error instanceof Error ? error.message : String(error) })
    }
  }

  const load = (documentId: string): Promise<LoadedDocument> => {
    const cached = loads.get(documentId)
    if (cached !== undefined) return cached
    const loading = (async () => {
      const first = await call({ action: 'document-get', documentId, page: 0 })
      if (first.kind !== 'document-content') throw new Error(t('settings.error.readerContent'))
      const pages = [first.document.content]
      for (let page = 1; page < first.document.pageCount; page++) {
        const next = await call({ action: 'document-get', documentId, page })
        if (next.kind !== 'document-content') throw new Error(t('settings.error.readerContent'))
        pages.push(next.document.content)
      }
      titles.set(documentId, first.document.title)
      return { documentId, title: first.document.title, format: first.document.format, content: pages.join('') }
    })()
    loads.set(documentId, loading)
    // A failed load is retried by the next view instead of being remembered.
    loading.catch(() => { if (loads.get(documentId) === loading) loads.delete(documentId) })
    return loading
  }

  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    refresh,
    importText,
    importFile,
    remove,
    load,
    title: documentId => titles.get(documentId),
    dispose: async () => {
      if (disposed) return
      disposed = true
      lifecycle.abort(new DOMException('Citer is shutting down', 'AbortError'))
      while (operations.size > 0) await Promise.allSettled([...operations])
    },
  }
}
