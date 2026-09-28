/** Call only public preference services. The selected service owns binding teardown. */
export function hostSettings(ctx) {
    const modern = ctx.get('configForms');
    if (modern !== undefined)
        return modern;
    const legacy = ctx.get('settingsScope');
    if (legacy === undefined)
        throw new Error('当前 DSH 未提供 Citer 所需的设置接口');
    return { get: (namespace) => legacy.bind({ namespace }), describe: () => legacy.describe() };
}
/** Normalize the renamed UI status source without creating another approval authority. */
export function hostInteractions(ctx) {
    const service = ctx.uiSession;
    if (service.pendingInteractions !== undefined)
        return service.pendingInteractions;
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
