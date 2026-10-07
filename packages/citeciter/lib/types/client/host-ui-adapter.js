/** Call only public preference services. The selected service owns binding teardown. */
export function hostSettings(ctx) {
    const forms = ctx.get('configForms');
    if (forms === undefined)
        throw new Error('当前 DSH 未提供 Citer 所需的设置接口');
    return forms;
}
/** Project native UI status without creating another approval authority. */
export function hostInteractions(ctx) {
    const service = ctx.uiSession;
    const source = service.sessionStatus;
    if (source === undefined)
        throw new Error('当前 DSH 未提供 Citer 所需的审批展示接口');
    let previous;
    let current = new Map();
    return {
        subscribe: listener => source.subscribe(listener),
        getSnapshot: () => {
            const next = source.getSnapshot();
            if (next !== previous) {
                previous = next;
                current = new Map([...next].flatMap(([id, value]) => value.pendingInteraction === undefined ? [] : [[id, value.pendingInteraction]]));
            }
            return current;
        },
    };
}
