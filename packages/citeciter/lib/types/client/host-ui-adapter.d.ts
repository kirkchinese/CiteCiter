import type { Context } from '@deepseek-ai/cordis';
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { SessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Preference operations supplied by the official DSH ConfigForm service. */
export interface SettingsForm<T> extends ObservableSnapshot<{
    value: T | undefined;
    status: 'loading' | 'ready' | 'unavailable';
    mode: 'host' | 'memory';
}> {
    set(field: string, value: unknown): Promise<void>;
    unset(field: string): Promise<void>;
}
interface ModernForms {
    get<T>(namespace: string): SettingsForm<T>;
    describe(): SettingsDescribeFace;
}
/** Call only public preference services. The selected service owns binding teardown. */
export declare function hostSettings(ctx: Context): ModernForms;
export type InteractionSnapshot = ReadonlyMap<SessionId, SessionPendingInteraction>;
/** One row of DSH's per-Session UI status table; fields a release lacks stay undefined. */
export interface HostSessionStatusRow {
    readonly running?: boolean | undefined;
    readonly pendingInteraction?: SessionPendingInteraction | undefined;
}
/**
 * DSH's per-Session UI status table. Until 0.2.2 it is the `sessionStatus` property of `uiSession`; from 0.2.3 it
 * is the separate `uiSession.sessionStatus` service, which a property read only reaches when the plugin injects it
 * (otherwise Cordis throws). `ctx.get` reads either form without injecting.
 * @returns the table, or undefined when this DSH has none yet.
 */
export declare function hostSessionStatus(ctx: Context): ObservableSnapshot<ReadonlyMap<SessionId, HostSessionStatusRow>> | undefined;
/** Project native UI status without creating another approval authority. */
export declare function hostInteractions(ctx: Context): ObservableSnapshot<InteractionSnapshot>;
export {};
