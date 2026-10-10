import type { Context } from '@deepseek-ai/cordis'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { SessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'

/** Preference operations supplied by the official DSH ConfigForm service. */
export interface SettingsForm<T> extends ObservableSnapshot<{ value: T | undefined; status: 'loading' | 'ready' | 'unavailable'; mode: 'host' | 'memory' }> {
  set(field: string, value: unknown): Promise<void>
  unset(field: string): Promise<void>
}
interface ModernForms { get<T>(namespace: string): SettingsForm<T>; describe(): SettingsDescribeFace }

/** Call only public preference services. The selected service owns binding teardown. */
export function hostSettings(ctx: Context): ModernForms {
  const forms = ctx.get('configForms') as ModernForms | undefined
  if (forms === undefined) throw new Error('当前 DSH 未提供 Citer 所需的设置接口')
  return forms
}

export type InteractionSnapshot = ReadonlyMap<SessionId, SessionPendingInteraction>
/** Project native UI status without creating another approval authority. */
export function hostInteractions(ctx: Context): ObservableSnapshot<InteractionSnapshot> {
  const service = ctx.uiSession as unknown as {
    sessionStatus?: ObservableSnapshot<ReadonlyMap<SessionId, { pendingInteraction: SessionPendingInteraction | undefined }>>
  }
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
