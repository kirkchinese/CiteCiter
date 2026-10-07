import type { Context } from '@deepseek-ai/cordis'
import type z from '@deepseek-ai/schemastery'
import type {} from '@deepseek-ai/dsh-settings'
import { DEFAULT_CITECITER_SETTINGS, citeCiterSettingsSchema, type CiteCiterSettings } from './topic.ts'

/** Official DSH supplies a live Cordis configuration reader. */
export interface SettingsReader { get(): unknown }

/** Keep settings live through the official Cordis configuration contract. */
export function settingsConfig(schema: z<object>) {
  return schema.volatile()
}

/** Bind settings to their owning plugin; registrations are released with ctx. */
export function bindHostSettings(ctx: Context, config: SettingsReader): () => CiteCiterSettings {
  ctx.inject(['settings'], settingsCtx => {
    settingsCtx.effect(() => settingsCtx.settings.configure({ auto: false }, ctx.fiber))
  })
  return () => {
    const parsed = citeCiterSettingsSchema.safeParse(config.get())
    return parsed.success ? parsed.data : DEFAULT_CITECITER_SETTINGS
  }
}
