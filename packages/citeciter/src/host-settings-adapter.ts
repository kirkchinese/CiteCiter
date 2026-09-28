import type { Context } from '@deepseek-ai/cordis'
import type z from '@deepseek-ai/schemastery'
import { CITECITER_SETTINGS_NAMESPACE, DEFAULT_CITECITER_SETTINGS, citeCiterSettingsSchema, type CiteCiterSettings } from './topic.ts'

/** The 0.1.7 Cordis configuration reader. Old hosts pass no reader. */
export interface SettingsReader { get(): unknown }
interface Settings015 {
  register(namespace: string, schema: z<object>): unknown
  get(namespace: string): unknown
}
interface Settings017 { configure(options: { auto: boolean }, owner: Context['fiber']): () => void }

/** Choose the schema mode without importing a Cordis export absent in Desktop's SDK. */
export function settingsConfig(schema: z<object>): z<object> {
  const modern = schema as z<object> & { volatile?: () => z<object> }
  return modern.volatile?.() ?? schema
}

/** Bind settings through the public contract of the installed host; registrations belong to ctx. */
export function bindHostSettings(ctx: Context, schema: z<object>, config?: SettingsReader): () => CiteCiterSettings {
  let read: () => unknown = () => undefined
  ctx.inject(['settings'], settingsCtx => {
    const service = settingsCtx.settings as unknown as Settings015 | Settings017
    if ('configure' in service) {
      if (typeof config?.get !== 'function') throw new Error('DSH 未提供 Citer 配置读取器')
      settingsCtx.effect(() => service.configure({ auto: false }, ctx.fiber))
      read = () => config.get()
    } else {
      service.register(CITECITER_SETTINGS_NAMESPACE, schema)
      read = () => service.get(CITECITER_SETTINGS_NAMESPACE)
    }
  })
  return () => {
    const parsed = citeCiterSettingsSchema.safeParse(read())
    return parsed.success ? parsed.data : DEFAULT_CITECITER_SETTINGS
  }
}
