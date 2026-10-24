import type { TopicMessage } from '../../topic.ts';
import type { NativeComposer } from '../native-composer.ts';
type ToolMessage = Extract<TopicMessage, {
    role: 'tool';
}>;
/** Keep a tool tree inside the parent's disclosure; absent metadata uses the original lossless inspector. */
export declare function ToolRow({ message, childCalls, sessionId, load }: {
    readonly message: ToolMessage;
    readonly childCalls: readonly ToolMessage[];
    readonly sessionId: string;
    readonly load: NativeComposer['attachment'];
}): import("react").JSX.Element;
export {};
