import { actionSourceSession } from "./action-controller.js";
/** Bind explicit Topic and document services. No UI, global listeners or Cordis discovery. */
export function createActionExecutor(companion, reader, open) {
    const imports = new WeakMap();
    return async (source, action, question, modelRoute) => {
        const sourceId = actionSourceSession(source);
        const assertSource = () => {
            if (companion.getSnapshot().sourceSessionId !== sourceId)
                throw new Error('来源会话已切换，请返回原文件或重新选文');
        };
        assertSource();
        open(action.presentation);
        if (source.kind === 'conversation') {
            await companion.create(source.selection, question, undefined, action.scenario, modelRoute);
            assertSource();
            if (companion.getSnapshot().phase === 'error')
                throw new Error(companion.getSnapshot().error ?? '创建失败');
            return;
        }
        let documentId = source.documentId ?? imports.get(source);
        if (documentId === undefined) {
            if (source.content === undefined)
                throw new Error('文件快照不可用，请重新选择');
            const imported = await reader.importFile(source.title.slice(0, 200), source.content);
            if (imported === null)
                throw new Error(reader.getSnapshot().error ?? '无法保存文件快照');
            documentId = imported.documentId;
            imports.set(source, documentId);
        }
        assertSource();
        await companion.createFromDocument({ documentId, displayText: source.displayText, prefixText: source.prefixText, suffixText: source.suffixText }, question, sourceId, modelRoute);
        assertSource();
        reader.setOpen(false);
    };
}
