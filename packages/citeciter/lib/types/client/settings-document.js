const INITIAL = Object.freeze({
    status: 'idle',
    opening: false,
    error: null,
    message: null,
});
function memoryStore(initial) {
    let state = initial;
    const listeners = new Set();
    return {
        getSnapshot: () => state,
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
        update: (mutator) => {
            const next = { ...state };
            mutator(next);
            state = next;
            for (const listener of [...listeners])
                listener();
        },
        set: (next) => {
            state = next;
            for (const listener of [...listeners])
                listener();
        },
    };
}
/**
 * Create the browser owner for the Host settings-document action.
 * @param describe - mirrored Host settings-document availability.
 * @param openDocument - Host operation that opens the authoritative file.
 * @returns observable loading, availability, and action state.
 */
export function createSettingsDocumentController(describe, openDocument) {
    const store = memoryStore(INITIAL);
    let unsubscribe = null;
    let opening = null;
    let disposed = false;
    const operations = new Set();
    const track = (operation) => {
        let tracked;
        tracked = operation.finally(() => operations.delete(tracked));
        operations.add(tracked);
        return tracked;
    };
    const derive = () => {
        const mirrored = describe.getSnapshot();
        if (mirrored.view === undefined) {
            store.update((state) => {
                state.status = mirrored.status === 'loading'
                    ? 'loading'
                    : mirrored.status === 'unavailable' ? 'unavailable' : mirrored.error === null ? 'idle' : 'error';
                state.error = mirrored.status === 'unavailable'
                    ? mirrored.error ?? '当前宿主不支持打开配置文件'
                    : mirrored.error;
                state.message = null;
            });
            return;
        }
        const hasDocument = mirrored.view.hasDocument;
        store.update((state) => {
            state.status = hasDocument ? 'ready' : 'missing';
            state.error = hasDocument ? mirrored.error : '配置文件不存在';
            state.message = null;
        });
    };
    const load = async () => {
        if (disposed)
            return;
        unsubscribe ??= describe.subscribe(derive);
        store.update((state) => {
            state.status = 'loading';
            state.error = null;
            state.message = null;
        });
        try {
            await track(describe.ensure());
            if (!disposed)
                derive();
        }
        catch (error) {
            if (!disposed)
                store.update((state) => {
                    state.status = 'error';
                    state.error = error instanceof Error ? error.message : String(error);
                });
        }
    };
    return {
        getSnapshot: store.getSnapshot,
        subscribe: store.subscribe,
        load,
        open: async () => {
            if (store.getSnapshot().status === 'idle' || store.getSnapshot().status === 'error')
                await load();
            if (disposed || store.getSnapshot().status !== 'ready' || store.getSnapshot().opening)
                return;
            const abort = new AbortController();
            opening = abort;
            store.update((state) => {
                state.opening = true;
                state.error = null;
                state.message = null;
            });
            try {
                await track(openDocument(abort.signal));
                if (!disposed)
                    store.update((state) => {
                        state.opening = false;
                        state.message = '已打开配置文件';
                    });
            }
            catch (error) {
                if (!disposed)
                    store.update((state) => {
                        state.opening = false;
                        state.error = error instanceof Error ? error.message : String(error);
                    });
            }
            finally {
                if (opening === abort)
                    opening = null;
            }
        },
        dispose: async () => {
            if (disposed)
                return;
            disposed = true;
            opening?.abort();
            opening = null;
            unsubscribe?.();
            unsubscribe = null;
            while (operations.size > 0)
                await Promise.allSettled([...operations]);
        },
    };
}
