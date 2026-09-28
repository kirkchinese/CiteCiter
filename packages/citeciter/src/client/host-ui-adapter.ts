import type { Context } from '@deepseek-ai/cordis'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Stable preference operations shared by SettingsScope (0.1.5) and ConfigForm (0.1.7). */
export interface SettingsForm<T> extends ObservableSnapshot<{ value: T | undefined; status: 'loading' | 'ready' | 'unavailable'; mode: 'host' | 'memory' }> {
  set(field: string, value: unknown): Promise<void>
  unset(field: string): Promise<void>
}
interface ModernForms { get<T>(namespace: string): SettingsForm<T>; describe(): SettingsDescribeFace }
interface LegacyForms { bind<T>(spec: { namespace: string }): SettingsForm<T>; describe(): SettingsDescribeFace }

/** Call only public preference services. The selected service owns binding teardown. */
export function hostSettings(ctx: Context): ModernForms {
  const modern = ctx.get('configForms') as ModernForms | undefined
  if (modern !== undefined) return modern
  const legacy = ctx.get('settingsScope') as LegacyForms | undefined
  if (legacy === undefined) throw new Error('当前 DSH 未提供 Citer 所需的设置接口')
  return { get: <T>(namespace: string) => legacy.bind<T>({ namespace }), describe: () => legacy.describe() }
}

export type InteractionSnapshot = ReadonlyMap<SessionId, SessionPendingInteraction>
/** Normalize the renamed UI status source without creating another approval authority. */
export function hostInteractions(ctx: Context): ObservableSnapshot<InteractionSnapshot> {
  const service = ctx.uiSession as unknown as {
    sessionStatus?: ObservableSnapshot<ReadonlyMap<SessionId, { pendingInteraction: SessionPendingInteraction | undefined }>>
    pendingInteractions?: ObservableSnapshot<InteractionSnapshot>
  }
  if (service.pendingInteractions !== undefined) return service.pendingInteractions
  const source = service.sessionStatus
  if (source === undefined) throw new Error('当前 DSH 未提供 Citer 所需的审批展示接口')
  let previous: ReturnType<typeof source.getSnapshot> | undefined
  let current: InteractionSnapshot = new Map()
  return {
    subscribe: listener => source.subscribe(listener),
    getSnapshot: () => {
      const next = source.getSnapshot()
      if (next !== previous) {
        previous = next
        current = new Map([...next].flatMap(([id, value]) => value.pendingInteraction === undefined ? [] : [[id, value.pendingInteraction] as const]))
      }
      return current
    },
  }
}
