import { t } from './i18n.ts'
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
  if (forms === undefined) throw new Error(t('panel.error.settingsUnavailable'))
  return forms
}

export type InteractionSnapshot = ReadonlyMap<SessionId, SessionPendingInteraction>
/** One row of DSH's per-Session UI status table; fields a release lacks stay undefined. */
export interface HostSessionStatusRow {
  readonly running?: boolean | undefined
  readonly pendingInteraction?: SessionPendingInteraction | undefined
}

/**
 * DSH's per-Session UI status table. Until 0.2.2 it is the `sessionStatus` property of `uiSession`; from 0.2.3 it
 * is the separate `uiSession.sessionStatus` service, which a property read only reaches when the plugin injects it
 * (otherwise Cordis throws). `ctx.get` reads either form without injecting.
 * @returns the table, or undefined when this DSH has none yet.
 */
export function hostSessionStatus(ctx: Context): ObservableSnapshot<ReadonlyMap<SessionId, HostSessionStatusRow>> | undefined {
  const service = ctx.get('uiSession.sessionStatus') as ObservableSnapshot<ReadonlyMap<SessionId, HostSessionStatusRow>> | undefined
  if (service !== undefined) return service
  try {
    return (ctx.get('uiSession') as { sessionStatus?: ObservableSnapshot<ReadonlyMap<SessionId, HostSessionStatusRow>> } | undefined)?.sessionStatus
  } catch (error) {
    // Cordis refuses a nested service this plugin did not inject; that DSH publishes the table as a service.
    void error
    return undefined
  }
}

/** Project native UI status without creating another approval authority. */
export function hostInteractions(ctx: Context): ObservableSnapshot<InteractionSnapshot> {
  // From 0.2.3 `uiSession` publishes the effective pending interaction per Session directly.
  const direct = (ctx.get('uiSession') as { pendingInteractions?: ObservableSnapshot<InteractionSnapshot> } | undefined)?.pendingInteractions
  if (direct !== undefined) return direct
  const source = hostSessionStatus(ctx)
  if (source === undefined) throw new Error(t('panel.error.approvalUnavailable'))
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
