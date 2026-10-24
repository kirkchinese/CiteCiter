import type { TopicMessage } from '../../topic.ts';
/** One logged context row; only known Host presentation copy is localized, never its model-visible body. */
export declare function ContextRow({ message }: {
    readonly message: Extract<TopicMessage, {
        role: 'context';
    }>;
}): import("react").JSX.Element;
