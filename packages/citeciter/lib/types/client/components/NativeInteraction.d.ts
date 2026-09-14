import type { SessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client';
import type { TopicMessage } from '../../topic.ts';
/** Present the Host's one-shot pending request. Decisions go to its existing waterfall; no second permission authority is created. Remount on pending.key. */
export declare function NativeInteraction({ pending, messages }: {
    readonly pending: SessionPendingInteraction;
    readonly messages: readonly TopicMessage[];
}): import("react").JSX.Element;
