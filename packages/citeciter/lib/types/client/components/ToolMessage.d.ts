import type { TopicMessage } from '../../topic.ts';
import type { NativeComposer } from '../native-composer.ts';
type ToolMessage = Extract<TopicMessage, {
    role: 'tool';
}>;
/** Keep a tool tree inside the parent's disclosure; absent metadata uses the original lossless inspector. */
export declare function ToolRow({ message, childCalls, sessionId, load, openFile }: {
    readonly message: ToolMessage;
    readonly childCalls: readonly ToolMessage[];
    readonly sessionId: string;
    readonly load: NativeComposer['attachment'];
    /** Open a source-workspace file in DSH's right sidebar; absent when the host has none. */
    readonly openFile?: ((path: string, line?: number) => boolean) | undefined;
}): import("react").JSX.Element;
export {};
