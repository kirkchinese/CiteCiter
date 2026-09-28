import type { Context } from '@deepseek-ai/cordis';
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { SettingsDescribeFace } from '@deepseek-ai/dsh-client-ui-settings/client';
import type { SessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Stable preference operations shared by SettingsScope (0.1.5) and ConfigForm (0.1.7). */
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
/** Normalize the renamed UI status source without creating another approval authority. */
export declare function hostInteractions(ctx: Context): ObservableSnapshot<InteractionSnapshot>;
export {};
