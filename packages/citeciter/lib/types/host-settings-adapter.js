import { CITECITER_SETTINGS_NAMESPACE, DEFAULT_CITECITER_SETTINGS, citeCiterSettingsSchema } from "./topic.js";
/** Choose the schema mode without importing a Cordis export absent in Desktop's SDK. */
export function settingsConfig(schema) {
    const modern = schema;
    return modern.volatile?.() ?? schema;
}
/** Bind settings through the public contract of the installed host; registrations belong to ctx. */
export function bindHostSettings(ctx, schema, config) {
    let read = () => undefined;
    ctx.inject(['settings'], settingsCtx => {
        const service = settingsCtx.settings;
        if ('configure' in service) {
            if (typeof config?.get !== 'function')
                throw new Error('DSH 未提供 Citer 配置读取器');
            settingsCtx.effect(() => service.configure({ auto: false }, ctx.fiber));
            read = () => config.get();
        }
        else {
            service.register(CITECITER_SETTINGS_NAMESPACE, schema);
            read = () => service.get(CITECITER_SETTINGS_NAMESPACE);
        }
    });
    return () => {
        const parsed = citeCiterSettingsSchema.safeParse(read());
        return parsed.success ? parsed.data : DEFAULT_CITECITER_SETTINGS;
    };
}
