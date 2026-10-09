import { DRAFT_CHUNK_BYTES, EMPTY_DRAFT, EMPTY_DRAFT_STATE, subtractSubmitted } from "../draft-contract.js";
import { mergeDraftReferences } from "./draft-references.js";
import { mergeDraftContent } from "./draft-merge.js";
export const EMPTY_DRAFT_VIEW = { content: EMPTY_DRAFT, files: [], missing: [], ready: false, sending: false, pending: false, error: null };
/** Own draft persistence and attachment lifetimes independently of panel mounting and Topic navigation. */
export function createDraftController(request, native, isOperating) {
    const entries = new Map();
    const listeners = new Set();
    let snapshot = {};
    let disposed = false;
    const current = (id, entry) => !disposed && entries.get(id) === entry;
    const emit = (id, entry, patch = {}) => {
        if (!current(id, entry))
            return;
        entry.view = { ...entry.view, ...patch, content: entry.state.content,
            files: entry.state.content.files.flatMap(file => { const item = entry.files.get(file.id); return item === undefined ? [] : [item.native]; }),
            missing: entry.state.content.files.filter(file => !entry.files.has(file.id)), pending: entry.state.pending !== null,
        };
        snapshot = { ...snapshot, [id]: entry.view };
        if (!disposed)
            for (const listener of listeners)
                listener();
    };
    const entryOf = (id) => {
        let entry = entries.get(id);
        if (entry === undefined) {
            entry = { state: EMPTY_DRAFT_STATE, base: EMPTY_DRAFT_STATE, composing: false, files: new Map(), generation: 0, saved: 0, view: EMPTY_DRAFT_VIEW };
            entries.set(id, entry);
        }
        return entry;
    };
    const fail = (id, entry, error) => emit(id, entry, { error: error instanceof Error ? error.message : String(error) });
    const restoreFiles = async (id, entry) => {
        const files = new Map([...entry.state.content.files, ...(entry.state.pending?.content.files ?? [])].map(file => [file.id, file]));
        for (const meta of files.values()) {
            if (!current(id, entry))
                return;
            if (entry.files.has(meta.id))
                continue;
            try {
                const chunks = [];
                for (let offset = 0; offset < meta.size; offset += DRAFT_CHUNK_BYTES) {
                    const chunk = await request({ action: 'draft-file-get', topicSessionId: id, fileId: meta.id, offset });
                    if (!current(id, entry))
                        return;
                    if (chunk.kind !== 'draft-file')
                        throw new Error('草稿附件响应类型不匹配');
                    const bytes = Uint8Array.from(atob(chunk.data), char => char.charCodeAt(0));
                    if (bytes.length !== Math.min(DRAFT_CHUNK_BYTES, meta.size - offset))
                        throw new Error('草稿附件读取不完整');
                    chunks.push(bytes);
                }
                const file = new File(chunks, meta.name, { type: meta.type, lastModified: meta.lastModified });
                const [attachment] = await native.add(id, [file]);
                if (attachment === undefined)
                    throw new Error('DSH 未恢复附件');
                if (!current(id, entry)) {
                    native.remove(attachment.id);
                    return;
                }
                if (![...entry.state.content.files, ...(entry.state.pending?.content.files ?? [])].some(item => item.id === meta.id)) {
                    native.remove(attachment.id);
                    continue;
                }
                entry.files.set(meta.id, { meta, native: attachment, saved: true });
            }
            catch (error) {
                fail(id, entry, `无法恢复 ${meta.name}：${String(error)}；请移除或重新添加`);
            }
        }
    };
    const ensureEntry = async (id, entry) => {
        if (!current(id, entry))
            return;
        if (entry.view.ready)
            return;
        if (entry.loading !== undefined)
            return entry.loading;
        entry.loading = (async () => {
            const response = await request({ action: 'draft-get', topicSessionId: id });
            if (response.kind !== 'draft')
                throw new Error('草稿响应类型不匹配');
            if (!current(id, entry))
                return;
            entry.state = response.state;
            entry.base = response.state;
            await restoreFiles(id, entry);
            emit(id, entry, { ready: true });
        })().catch(error => { fail(id, entry, error); throw error; }).finally(() => { delete entry.loading; });
        return entry.loading;
    };
    const ensure = async (id) => {
        if (disposed)
            return;
        return ensureEntry(id, entryOf(id));
    };
    const persistFile = async (id, entry, item) => {
        if (item.saved)
            return;
        for (let offset = 0; offset < item.meta.size || offset === 0; offset += DRAFT_CHUNK_BYTES) {
            if (!current(id, entry))
                return;
            const bytes = new Uint8Array(await item.native.file.slice(offset, offset + DRAFT_CHUNK_BYTES).arrayBuffer());
            if (!current(id, entry))
                return;
            let binary = '';
            for (let start = 0; start < bytes.length; start += 8192)
                binary += String.fromCharCode(...bytes.subarray(start, start + 8192));
            await request({ action: 'draft-file-put', topicSessionId: id, file: item.meta, offset, data: btoa(binary) });
            if (!current(id, entry))
                return;
        }
        item.saved = true;
    };
    const rebase = (id, entry, remote) => {
        const pendingChanged = JSON.stringify(entry.state.pending) !== JSON.stringify(entry.base.pending);
        const remotePendingChanged = JSON.stringify(remote.pending) !== JSON.stringify(entry.base.pending);
        const pending = pendingChanged && !(remotePendingChanged && remote.pending !== null) ? entry.state.pending : remote.pending;
        entry.state = { ...remote, content: mergeDraftContent(entry.base.content, entry.state.content, remote.content, isOperating()), pending };
        entry.base = remote;
        delete entry.remote;
        const retained = new Set([...remote.content.files, ...(remote.pending?.content.files ?? [])].map(file => file.id));
        const wanted = new Set([...entry.state.content.files, ...(pending?.content.files ?? [])].map(file => file.id));
        for (const [key, file] of entry.files) {
            if (!wanted.has(key)) {
                native.remove(file.native.id);
                entry.files.delete(key);
            }
            else if (!retained.has(key))
                file.saved = false;
        }
        emit(id, entry);
    };
    // Every continuation keeps the captured entry. A forgotten/reloaded identity
    // must never be recreated by a late save, upload or timer from its old entry.
    const flushEntry = async (id, entry) => {
        await ensureEntry(id, entry);
        if (!current(id, entry))
            return;
        if (entry.timer !== undefined) {
            clearTimeout(entry.timer);
            delete entry.timer;
        }
        if (entry.saving !== undefined) {
            await entry.saving;
            if (current(id, entry) && entry.saved < entry.generation)
                return flushEntry(id, entry);
            return;
        }
        if (entry.composing)
            return;
        entry.saving = (async () => {
            let collisions = 0;
            if (entry.view.error !== null)
                emit(id, entry, { error: null });
            while (entry.saved < entry.generation) {
                if (!current(id, entry))
                    return;
                if (entry.composing)
                    return;
                if (entry.remote !== undefined) {
                    rebase(id, entry, entry.remote);
                    await restoreFiles(id, entry);
                    if (!current(id, entry))
                        return;
                    emit(id, entry);
                }
                for (const item of entry.files.values())
                    await persistFile(id, entry, item);
                if (!current(id, entry))
                    return;
                if (entry.composing)
                    return;
                const generation = entry.generation;
                const outgoing = entry.state;
                const response = await request({ action: 'draft-save', topicSessionId: id, state: outgoing });
                if (!current(id, entry))
                    return;
                if (response.kind !== 'draft')
                    throw new Error('草稿保存响应类型不匹配');
                if (response.conflict) {
                    entry.remote = response.state;
                    // Yield after repeated competing writes; keep unsaved work and retry quietly.
                    if (++collisions >= 4) {
                        entry.timer = setTimeout(() => { void flushEntry(id, entry).catch(() => { }); }, 250);
                        return;
                    }
                    continue;
                }
                entry.base = response.state;
                entry.state = { ...entry.state, revision: response.state.revision };
                entry.saved = generation;
            }
        })().catch(error => { fail(id, entry, error); throw error; }).finally(() => { delete entry.saving; });
        return entry.saving;
    };
    const flush = async (id) => {
        if (disposed)
            return;
        return flushEntry(id, entryOf(id));
    };
    const changed = (id, entry) => {
        if (!current(id, entry))
            return;
        entry.generation++;
        emit(id, entry);
        clearTimeout(entry.timer);
        entry.timer = setTimeout(() => { void flushEntry(id, entry).catch(() => { }); }, 150);
    };
    const mutate = async (id, change) => {
        // Controlled input values must be echoed before the React event returns.
        // Yielding even for a ready draft restores the previous value and ends IME composition.
        if (disposed)
            return;
        const entry = entryOf(id);
        if (!entry.view.ready)
            await ensureEntry(id, entry);
        if (!current(id, entry))
            return;
        change(entry);
        changed(id, entry);
    };
    return {
        getSnapshot: () => snapshot,
        subscribe: (listener) => { listeners.add(listener); return () => { listeners.delete(listener); }; },
        /** Pending receipts are already durable; only unflushed local edits need a navigation warning. */
        hasUnsavedChanges: () => [...entries.values()].some(entry => entry.generation !== entry.saved),
        flushAll: () => Promise.allSettled([...entries].filter(([, entry]) => entry.view.ready).map(([id, entry]) => flushEntry(id, entry))),
        ensure, flush,
        /** Defer remote text reconciliation until the input method commits its candidate. */
        setComposing: (id, composing) => {
            if (disposed)
                return;
            const entry = entryOf(id);
            entry.composing = composing;
            if (!composing && entry.saved < entry.generation)
                changed(id, entry);
        },
        /** Publish ready-draft edits synchronously; the returned promise only waits for an initial load when needed. */
        setText: (id, text) => mutate(id, entry => { entry.state = { ...entry.state, content: { ...entry.state.content, text } }; }),
        append: (id, text, references) => mutate(id, entry => {
            entry.state = { ...entry.state, content: { ...entry.state.content,
                    text: [entry.state.content.text, text].filter(Boolean).join('\n\n'), references: [...mergeDraftReferences(entry.state.content.references, references)],
                } };
        }),
        removeReference: (id, referenceId) => mutate(id, entry => {
            entry.state = { ...entry.state, content: { ...entry.state.content, references: entry.state.content.references.filter(item => item.id !== referenceId) } };
        }),
        addFiles: async (id, files) => {
            if (disposed)
                return;
            const entry = entryOf(id);
            await ensureEntry(id, entry);
            if (!current(id, entry))
                return;
            if (entry.state.content.files.length + files.length > 32 || files.some(file => file.size > 100 * 1024 * 1024))
                throw new Error('草稿最多保留 32 个附件，每个附件不超过 100 MiB');
            const added = await native.add(id, files);
            if (!current(id, entry)) {
                for (const item of added)
                    native.remove(item.id);
                return;
            }
            const metas = added.map(attachment => {
                const meta = { id: crypto.randomUUID(), name: attachment.file.name, type: attachment.file.type, size: attachment.file.size, lastModified: attachment.file.lastModified };
                entry.files.set(meta.id, { meta, native: attachment, saved: false });
                return meta;
            });
            entry.state = { ...entry.state, content: { ...entry.state.content, files: [...entry.state.content.files, ...metas] } };
            changed(id, entry);
        },
        removeFile: (id, fileId) => mutate(id, entry => {
            const item = [...entry.files.values()].find(item => item.native.id === fileId || item.meta.id === fileId);
            if (item !== undefined && !entry.state.pending?.content.files.some(file => file.id === item.meta.id)) {
                native.remove(item.native.id);
                entry.files.delete(item.meta.id);
            }
            entry.state = { ...entry.state, content: { ...entry.state.content, files: entry.state.content.files.filter(file => file.id !== (item?.meta.id ?? fileId)) } };
        }),
        /** Persist the exact outgoing snapshot and identity before native submission begins. */
        submit: async (id, send, retry = false) => {
            if (disposed)
                return false;
            const entry = entryOf(id);
            if (!entry.view.ready)
                await ensureEntry(id, entry);
            if (!current(id, entry))
                return false;
            if (entry.view.sending)
                return false;
            emit(id, entry, { sending: true });
            try {
                if (entry.composing)
                    return false;
                if (entry.view.missing.length !== 0)
                    throw new Error('请先移除或重新添加无法恢复的附件');
                if (entry.state.pending !== null && !retry)
                    throw new Error('上次发送状态未确认，请先核对或明确重试上次发送');
                // Freeze the user's submit event before saving can yield to later editing.
                // Pin its files via pending so a concurrent remove cannot release this send's bytes.
                const content = entry.state.pending?.content ?? entry.state.content;
                if (content.files.some(file => !entry.files.has(file.id)))
                    throw new Error('上次发送的附件无法恢复，请先核对发送状态');
                const outgoingFiles = content.files.map(file => entry.files.get(file.id).native);
                const requestId = entry.state.pending?.requestId ?? crypto.randomUUID();
                entry.state = { ...entry.state, pending: { requestId, content } };
                entry.generation++;
                await flushEntry(id, entry);
                if (!current(id, entry))
                    return false;
                if (entry.state.pending?.requestId !== requestId || entry.base.pending?.requestId !== requestId)
                    throw new Error('草稿尚未保存，未发送；请稍后重试');
                const sent = await send(content, outgoingFiles, requestId);
                if (!current(id, entry))
                    return false;
                if (sent) {
                    entry.state = { ...entry.state, content: subtractSubmitted(entry.state.content, content), pending: null };
                    for (const file of content.files)
                        entry.files.delete(file.id);
                }
                else
                    entry.state = { ...entry.state, pending: null };
                changed(id, entry);
                await flushEntry(id, entry);
                return sent;
            }
            catch (error) {
                fail(id, entry, error);
                return false;
            }
            finally {
                emit(id, entry, { sending: false });
            }
        },
        /** Check a lost send response without replacing edits made while the check is in flight. */
        reconcile: async (id) => {
            if (disposed)
                return;
            const entry = entryOf(id);
            await flushEntry(id, entry);
            if (!current(id, entry))
                return;
            const response = await request({ action: 'draft-get', topicSessionId: id });
            if (response.kind !== 'draft')
                throw new Error('草稿响应类型不匹配');
            if (!current(id, entry))
                return;
            if (response.state.revision <= entry.state.revision)
                return;
            entry.remote = response.state;
            changed(id, entry);
            await flushEntry(id, entry);
        },
        forget: (id) => {
            const entry = entries.get(id);
            if (entry === undefined)
                return;
            clearTimeout(entry.timer);
            for (const file of entry.files.values())
                native.remove(file.native.id);
            entries.delete(id);
            const { [id]: _deleted, ...remaining } = snapshot;
            snapshot = remaining;
            for (const listener of listeners)
                listener();
        },
        dispose: async () => {
            await Promise.allSettled([...entries].filter(([, entry]) => entry.view.ready).map(([id, entry]) => flushEntry(id, entry)));
            disposed = true;
            for (const entry of entries.values())
                clearTimeout(entry.timer);
            listeners.clear();
        },
    };
}
