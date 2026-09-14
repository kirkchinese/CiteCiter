/** Reader panel controller: document library browsing, import, selection, and Topic creation. */
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store';
/** Initial Reader snapshot. */
export function createInitialReaderSnapshot() {
    return {
        open: false,
        documents: [],
        documentsStatus: 'idle',
        active: null,
        selection: null,
        question: '',
        creating: false,
        importing: false,
        loading: false,
        error: null,
    };
}
function remoteValue(result) {
    if (!result.ok)
        throw new Error(result.error.message);
    return result.value;
}
function formatFromName(name) {
    return /\.(md|markdown)$/iu.test(name) ? 'markdown' : 'text';
}
/** Bind the Reader store to the CiteCiter Remote and the companion Topic creator. */
export function createReaderController(request, companion, store = createSnapshotStore(createInitialReaderSnapshot())) {
    let disposed = false;
    const lifecycle = new AbortController();
    const operations = new Set();
    let documentGeneration = 0;
    let refreshGeneration = 0;
    const update = (mutator) => {
        if (!disposed)
            store.update(mutator);
    };
    const fail = (error) => {
        if (disposed)
            return;
        update((draft) => {
            draft.error = error instanceof Error ? error.message : String(error);
            draft.creating = false;
        });
    };
    const call = (command) => {
        const operation = (async () => {
            lifecycle.signal.throwIfAborted();
            const result = await request(command, lifecycle.signal);
            lifecycle.signal.throwIfAborted();
            return remoteValue(result);
        })().finally(() => operations.delete(operation));
        operations.add(operation);
        return operation;
    };
    const refresh = async () => {
        if (disposed)
            return;
        const generation = ++refreshGeneration;
        update((draft) => {
            draft.documentsStatus = 'loading';
            draft.error = null;
        });
        try {
            const response = await call({ action: 'documents' });
            if (generation !== refreshGeneration)
                return;
            if (response.kind !== 'documents')
                throw new Error('CiteCiter 返回了错误的文档列表响应');
            update((draft) => {
                draft.documents = response.documents;
                draft.documentsStatus = 'ready';
            });
        }
        catch (error) {
            if (!disposed && generation === refreshGeneration)
                update((draft) => {
                    draft.documentsStatus = 'error';
                    draft.error = error instanceof Error ? error.message : String(error);
                });
        }
    };
    const setOpen = (open) => {
        if (disposed || store.getSnapshot().open === open)
            return;
        update((draft) => {
            draft.open = open;
            draft.error = null;
        });
        if (open)
            void refresh();
    };
    const importFile = async (name, content) => {
        if (disposed)
            return null;
        try {
            const title = name.trim() === '' ? '未命名文档' : name.trim();
            const response = await call({
                action: 'document-import',
                title,
                format: formatFromName(name),
                content,
            });
            if (response.kind !== 'document')
                throw new Error('CiteCiter 返回了错误的文档导入响应');
            await refresh();
            return response.document;
        }
        catch (error) {
            fail(error);
            return null;
        }
    };
    const loadPage = async (documentId, page, resetQuestion) => {
        if (disposed)
            return;
        const generation = ++documentGeneration;
        update((draft) => {
            if (resetQuestion)
                draft.active = null;
            draft.selection = null;
            if (resetQuestion)
                draft.question = '';
            draft.error = null;
            draft.loading = true;
        });
        try {
            const response = await call({ action: 'document-get', documentId, page });
            if (generation !== documentGeneration)
                return;
            if (response.kind !== 'document-content')
                throw new Error('CiteCiter 返回了错误的文档内容响应');
            update((draft) => {
                draft.active = response.document;
            });
        }
        catch (error) {
            if (generation === documentGeneration)
                fail(error);
        }
        finally {
            if (generation === documentGeneration)
                update(draft => { draft.loading = false; });
        }
    };
    const openDocument = (documentId) => loadPage(documentId, 0, true);
    const openPage = async (page) => {
        const { active, loading } = store.getSnapshot();
        if (active === null || loading || page < 0 || page >= active.pageCount)
            return;
        await loadPage(active.documentId, page, false);
    };
    const importLocalFile = async (file) => {
        if (disposed || store.getSnapshot().importing)
            return;
        update(draft => { draft.importing = true; draft.error = null; });
        try {
            if (file.size > 8 * 1024 * 1024)
                throw new Error('文件过大；请导入不超过 2,000,000 个字符的文本');
            const content = await file.text();
            if (disposed)
                return;
            if (content.length > 2_000_000)
                throw new Error('文档不能超过 2,000,000 个字符');
            const imported = await importFile(file.name, content);
            if (imported !== null)
                await openDocument(imported.documentId);
        }
        catch (error) {
            fail(error);
        }
        finally {
            update(draft => { draft.importing = false; });
        }
    };
    const createTopic = async () => {
        if (disposed)
            return;
        const snapshot = store.getSnapshot();
        if (snapshot.creating || snapshot.loading)
            return;
        const generation = documentGeneration;
        const selection = snapshot.selection;
        const question = snapshot.question.trim();
        if (snapshot.active === null || selection === null) {
            fail(new Error('请先在文档中选择一段内容'));
            return;
        }
        if (question === '') {
            fail(new Error('请输入要问 CiteCiter 的问题'));
            return;
        }
        update((draft) => {
            draft.creating = true;
            draft.error = null;
        });
        try {
            await companion.createFromDocument({
                documentId: snapshot.active.documentId,
                displayText: selection.displayText,
                prefixText: selection.prefixText,
                suffixText: selection.suffixText,
            }, question);
            update((draft) => {
                draft.creating = false;
                if (generation === documentGeneration && draft.question === snapshot.question) {
                    draft.open = false;
                    draft.selection = null;
                    draft.question = '';
                }
            });
        }
        catch (error) {
            fail(error);
        }
    };
    return {
        getSnapshot: store.getSnapshot,
        subscribe: store.subscribe,
        setOpen,
        refresh,
        importFile,
        importLocalFile,
        openDocument,
        openPage,
        setSelection: (selection) => {
            if (disposed)
                return;
            update((draft) => {
                draft.selection = selection;
            });
        },
        setQuestion: (question) => {
            if (disposed)
                return;
            update((draft) => {
                draft.question = question;
            });
        },
        createTopic,
        dispose: async () => {
            if (disposed)
                return;
            disposed = true;
            lifecycle.abort(new DOMException('CiteCiter is shutting down', 'AbortError'));
            while (operations.size > 0)
                await Promise.allSettled([...operations]);
        },
    };
}
