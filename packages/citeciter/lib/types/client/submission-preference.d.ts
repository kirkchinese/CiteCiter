import type { Context } from '@deepseek-ai/cordis';
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { DeliveryMode } from './native-composer.ts';
/** Read the conversation-owned busy-Enter preference through the public settings mirror. The bound scope is disposed with ctx; this adapter never writes Host settings. */
export declare function bindSubmissionPreference(ctx: Context): ObservableSnapshot<DeliveryMode>;
