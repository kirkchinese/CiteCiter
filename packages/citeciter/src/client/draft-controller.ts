import type { ComposerAttachment } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { CiteCiterRequest, CiteCiterResponse } from '../topic.ts'
import { DRAFT_CHUNK_BYTES, EMPTY_DRAFT, EMPTY_DRAFT_STATE, subtractSubmitted, type DraftContent, type DraftFile, type DraftState } from '../draft-contract.ts'
import { mergeDraftReferences, type DraftReference } from './draft-references.ts'
import type { NativeComposer } from './native-composer.ts'

export interface DraftView {
  readonly content: DraftContent
  readonly files: readonly ComposerAttachment[]
  readonly missing: readonly DraftFile[]
  readonly ready: boolean
  readonly saving: boolean
  readonly sending: boolean
  readonly conflict: boolean
  readonly pending: boolean
  readonly error: string | null
}
export type DraftSnapshot = Readonly<Record<string, DraftView>>
export const EMPTY_DRAFT_VIEW: DraftView = { content: EMPTY_DRAFT, files: [], missing: [], ready: false, saving: false, sending: false, conflict: false, pending: false, error: null }
interface FileEntry { meta: DraftFile; native: ComposerAttachment; saved: boolean }
interface Entry {
  state: DraftState; files: Map<string, FileEntry>; generation: number; saved: number;
  view: DraftView; loading?: Promise<void>; saving?: Promise<void>; timer?: ReturnType<typeof setTimeout>;
}
type Request = (request: CiteCiterRequest) => Promise<CiteCiterResponse>

/** Own draft persistence and attachment lifetimes independently of panel mounting and Topic navigation. */
export function createDraftController(request: Request, native: NativeComposer) {
  const entries = new Map<string, Entry>()
  const listeners = new Set<() => void>()
  let snapshot: DraftSnapshot = {}
  let disposed = false
  const current = (id: string, entry: Entry) => !disposed && entries.get(id) === entry
  const emit = (id: string, entry: Entry, patch: Partial<DraftView> = {}) => {
    if (!current(id, entry)) return
    entry.view = { ...entry.view, ...patch, content: entry.state.content,
      files: entry.state.content.files.flatMap(file => { const item = entry.files.get(file.id); return item === undefined ? [] : [item.native] }),
      missing: entry.state.content.files.filter(file => !entry.files.has(file.id)), pending: entry.state.pending !== null,
    }
    snapshot = { ...snapshot, [id]: entry.view }
    if (!disposed) for (const listener of listeners) listener()
  }
  const entryOf = (id: string): Entry => {
    let entry = entries.get(id)
    if (entry === undefined) { entry = { state: EMPTY_DRAFT_STATE, files: new Map(), generation: 0, saved: 0, view: EMPTY_DRAFT_VIEW }; entries.set(id, entry) }
    return entry
  }
  const fail = (id: string, entry: Entry, error: unknown) => emit(id, entry, { error: error instanceof Error ? error.message : String(error) })
  const ensure = async (id: string): Promise<void> => {
    const entry = entryOf(id)
    if (entry.view.ready) return
    if (entry.loading !== undefined) return entry.loading
    entry.loading = (async () => {
      const response = await request({ action: 'draft-get', topicSessionId: id })
      if (response.kind !== 'draft') throw new Error('草稿响应类型不匹配')
      if (!current(id, entry)) return
      entry.state = response.state
      const files = new Map([...entry.state.content.files, ...(entry.state.pending?.content.files ?? [])].map(file => [file.id, file]))
      for (const meta of files.values()) {
        try {
          const chunks: Uint8Array<ArrayBuffer>[] = []
          for (let offset = 0; offset < meta.size; offset += DRAFT_CHUNK_BYTES) {
            const chunk = await request({ action: 'draft-file-get', topicSessionId: id, fileId: meta.id, offset })
            if (chunk.kind !== 'draft-file') throw new Error('草稿附件响应类型不匹配')
            const bytes = Uint8Array.from(atob(chunk.data), char => char.charCodeAt(0))
            if (bytes.length !== Math.min(DRAFT_CHUNK_BYTES, meta.size - offset)) throw new Error('草稿附件读取不完整')
            chunks.push(bytes)
          }
          const file = new File(chunks, meta.name, { type: meta.type, lastModified: meta.lastModified })
          const [attachment] = await native.add(id, [file])
          if (attachment === undefined) throw new Error('DSH 未恢复附件')
          if (!current(id, entry)) { native.remove(attachment.id); return }
          entry.files.set(meta.id, { meta, native: attachment, saved: true })
        } catch (error) { fail(id, entry, `无法恢复 ${meta.name}：${String(error)}；请移除或重新添加`) }
      }
      emit(id, entry, { ready: true })
    })().catch(error => { fail(id, entry, error); throw error }).finally(() => { delete entry.loading })
    return entry.loading
  }
  const persistFile = async (id: string, item: FileEntry) => {
    if (item.saved) return
    for (let offset = 0; offset < item.meta.size || offset === 0; offset += DRAFT_CHUNK_BYTES) {
      const bytes = new Uint8Array(await item.native.file.slice(offset, offset + DRAFT_CHUNK_BYTES).arrayBuffer())
      let binary = ''
      for (let start = 0; start < bytes.length; start += 8192) binary += String.fromCharCode(...bytes.subarray(start, start + 8192))
      await request({ action: 'draft-file-put', topicSessionId: id, file: item.meta, offset, data: btoa(binary) })
      if (disposed) throw new Error('Citer 已关闭，未完成草稿保存')
    }
    item.saved = true
  }
  const flush = async (id: string): Promise<void> => {
    await ensure(id)
    const entry = entryOf(id)
    if (entry.timer !== undefined) { clearTimeout(entry.timer); delete entry.timer }
    if (entry.saving !== undefined) { await entry.saving; if (entry.saved < entry.generation) return flush(id); return }
    if (entry.view.conflict) throw new Error('草稿已在另一窗口更改，请先选择保留哪个版本')
    entry.saving = (async () => {
      emit(id, entry, { saving: true, error: null })
      while (entry.saved < entry.generation) {
        if (!current(id, entry)) return
        for (const item of entry.files.values()) await persistFile(id, item)
        if (!current(id, entry)) return
        const generation = entry.generation
        const response = await request({ action: 'draft-save', topicSessionId: id, state: entry.state })
        if (response.kind !== 'draft') throw new Error('草稿保存响应类型不匹配')
        if (response.conflict) { emit(id, entry, { conflict: true }); throw new Error('草稿已在另一窗口更改；本窗口内容仍保留') }
        entry.state = { ...entry.state, revision: response.state.revision }
        entry.saved = generation
      }
    })().catch(error => { fail(id, entry, error); throw error }).finally(() => { delete entry.saving; emit(id, entry, { saving: false }) })
    return entry.saving
  }
  const changed = (id: string, entry: Entry) => {
    entry.generation++
    emit(id, entry)
    clearTimeout(entry.timer)
    entry.timer = setTimeout(() => { void flush(id).catch(() => { /* The view already exposes this save failure. */ }) }, 150)
  }
  const mutate = async (id: string, change: (entry: Entry) => void) => {
    // Controlled input values must be echoed before the React event returns.
    // Yielding even for a ready draft restores the previous value and ends IME composition.
    if (!entryOf(id).view.ready) await ensure(id)
    if (disposed) return
    const entry = entryOf(id)
    change(entry); changed(id, entry)
  }
  const reload = async (id: string) => {
    const old = entryOf(id)
    clearTimeout(old.timer)
    await old.saving?.catch(() => { /* Reload explicitly replaces this failed local version. */ })
    for (const item of old.files.values()) native.remove(item.native.id)
    entries.delete(id)
    await ensure(id)
  }
  return {
    getSnapshot: () => snapshot,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    /** Pending receipts are already durable; only unflushed local edits need a navigation warning. */
    hasUnsavedChanges: () => [...entries.values()].some(entry => entry.generation !== entry.saved),
    flushAll: () => Promise.allSettled([...entries.keys()].filter(id => entryOf(id).view.ready).map(flush)),
    ensure, flush,
    /** Publish ready-draft edits synchronously; the returned promise only waits for an initial load when needed. */
    setText: (id: string, text: string) => mutate(id, entry => { entry.state = { ...entry.state, content: { ...entry.state.content, text } } }),
    append: (id: string, text: string, references: readonly DraftReference[]) => mutate(id, entry => {
      entry.state = { ...entry.state, content: { ...entry.state.content,
        text: [entry.state.content.text, text].filter(Boolean).join('\n\n'), references: [...mergeDraftReferences(entry.state.content.references, references)],
      } }
    }),
    removeReference: (id: string, referenceId: string) => mutate(id, entry => {
      entry.state = { ...entry.state, content: { ...entry.state.content, references: entry.state.content.references.filter(item => item.id !== referenceId) } }
    }),
    addFiles: async (id: string, files: readonly File[]) => {
      await ensure(id)
      const entry = entryOf(id)
      if (entry.state.content.files.length + files.length > 32 || files.some(file => file.size > 100 * 1024 * 1024)) throw new Error('草稿最多保留 32 个附件，每个附件不超过 100 MiB')
      const added = await native.add(id, files)
      if (!current(id, entry)) { for (const item of added) native.remove(item.id); return }
      const metas = added.map(attachment => {
        const meta: DraftFile = { id: crypto.randomUUID(), name: attachment.file.name, type: attachment.file.type, size: attachment.file.size, lastModified: attachment.file.lastModified }
        entry.files.set(meta.id, { meta, native: attachment, saved: false }); return meta
      })
      entry.state = { ...entry.state, content: { ...entry.state.content, files: [...entry.state.content.files, ...metas] } }
      changed(id, entry)
    },
    removeFile: (id: string, fileId: string) => mutate(id, entry => {
      const item = [...entry.files.values()].find(item => item.native.id === fileId || item.meta.id === fileId)
      if (item !== undefined && !entry.state.pending?.content.files.some(file => file.id === item.meta.id)) { native.remove(item.native.id); entry.files.delete(item.meta.id) }
      entry.state = { ...entry.state, content: { ...entry.state.content, files: entry.state.content.files.filter(file => file.id !== (item?.meta.id ?? fileId)) } }
    }),
    /** Persist the exact outgoing snapshot and identity before native submission begins. */
    submit: async (id: string, send: (content: DraftContent, files: readonly ComposerAttachment[], requestId: string) => Promise<boolean>, retry = false): Promise<boolean> => {
      const entry = entryOf(id)
      if (!entry.view.ready) await ensure(id)
      if (!current(id, entry)) return false
      if (entry.view.sending) return false
      emit(id, entry, { sending: true })
      try {
        if (entry.view.missing.length !== 0) throw new Error('请先移除或重新添加无法恢复的附件')
        if (entry.state.pending !== null && !retry) throw new Error('上次发送状态未确认，请先核对或明确重试上次发送')
        // Freeze the user's submit event before saving can yield to later editing.
        // Pin its files via pending so a concurrent remove cannot release this send's bytes.
        const content = entry.state.pending?.content ?? entry.state.content
        if (content.files.some(file => !entry.files.has(file.id))) throw new Error('上次发送的附件无法恢复，请先核对发送状态')
        const outgoingFiles = content.files.map(file => entry.files.get(file.id)!.native)
        const requestId = entry.state.pending?.requestId ?? crypto.randomUUID()
        entry.state = { ...entry.state, pending: { requestId, content } }; entry.generation++
        await flush(id)
        if (!current(id, entry)) return false
        const sent = await send(content, outgoingFiles, requestId)
        if (sent) {
          entry.state = { ...entry.state, content: subtractSubmitted(entry.state.content, content), pending: null }
          for (const file of content.files) entry.files.delete(file.id)
        } else entry.state = { ...entry.state, pending: null }
        changed(id, entry)
        await flush(id)
        return sent
      } catch (error) { fail(id, entry, error); return false }
      finally { emit(id, entry, { sending: false }) }
    },
    reload,
    /** Check a lost send response without replacing edits made while the check is in flight. */
    reconcile: async (id: string) => {
      await flush(id)
      const entry = entryOf(id)
      const before = entry.state
      const response = await request({ action: 'draft-get', topicSessionId: id })
      if (response.kind !== 'draft') throw new Error('草稿响应类型不匹配')
      if (!current(id, entry)) return
      if (response.state.revision === entry.state.revision) return
      if (entry.state.revision === before.revision && before.pending !== null && response.state.pending === null && response.state.revision === before.revision + 1) {
        entry.state = { ...entry.state, revision: response.state.revision, content: subtractSubmitted(entry.state.content, before.pending.content), pending: null }
        changed(id, entry)
        await flush(id)
      } else {
        emit(id, entry, { conflict: true })
        throw new Error('核对期间草稿已被另一窗口更改；本窗口内容仍保留')
      }
    },
    /** Explicit conflict resolution: restore locally retained bytes removed by a peer, then CAS the latest revision. */
    keepLocal: async (id: string) => {
      const entry = entryOf(id)
      const response = await request({ action: 'draft-get', topicSessionId: id })
      if (response.kind !== 'draft') throw new Error('草稿响应类型不匹配')
      if (!current(id, entry)) return
      // A peer may have released the durable file while this window still owns its native File.
      // Include pending submissions: their bytes remain pinned until admission is reconciled.
      const retained = new Set([...response.state.content.files, ...(response.state.pending?.content.files ?? [])].map(file => file.id))
      for (const item of entry.files.values()) if (!retained.has(item.meta.id)) item.saved = false
      entry.state = { ...entry.state, revision: response.state.revision }
      emit(id, entry, { conflict: false }); changed(id, entry)
      try { await flush(id) }
      catch (error) { emit(id, entry, { conflict: true }); throw error }
    },
    forget: (id: string) => {
      const entry = entries.get(id)
      if (entry === undefined) return
      clearTimeout(entry.timer)
      for (const file of entry.files.values()) native.remove(file.native.id)
      entries.delete(id)
      const { [id]: _deleted, ...remaining } = snapshot; snapshot = remaining
      for (const listener of listeners) listener()
    },
    dispose: async () => {
      await Promise.allSettled([...entries.keys()].filter(id => entryOf(id).view.ready).map(flush))
      disposed = true
      for (const entry of entries.values()) clearTimeout(entry.timer)
      listeners.clear()
    },
  }
}
export type DraftController = ReturnType<typeof createDraftController>
