import { DEFAULT_CITECITER_SETTINGS, citeCiterSettingsSchema } from "./topic.js";
/** Keep settings live through the official Cordis configuration contract. */
export function settingsConfig(schema) {
    return schema.volatile();
}
/** Bind settings to their owning plugin; registrations are released with ctx. */
export function bindHostSettings(ctx, config) {
    ctx.inject(['settings'], settingsCtx => {
        settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber));
    });
    return () => {
        const parsed = citeCiterSettingsSchema.safeParse(config.get());
        return parsed.success ? parsed.data : DEFAULT_CITECITER_SETTINGS;
    };
}
