import type { ContentBlock } from '@deepseek-ai/dsh-llm';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
interface ContextMessage {
    id: string;
    content: readonly ContentBlock[];
    source: {
        kind: string;
        plugin?: string;
    };
}
/** Project the installed SDK's validated log. 0.1.7 split plugin context into developer/message. */
export declare function contextMessage(event: SessionEvent): (ContextMessage & {
    label: string;
}) | undefined;
export {};
