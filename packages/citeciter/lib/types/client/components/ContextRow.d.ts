import type { TopicMessage } from '../../topic.ts';
/**
 * One logged context message, drawn like DSH's context injection row: the role it plays, the
 * producer its source names and a notice's one-line summary, expanding to the exact text the
 * model received.
 */
export declare function ContextRow({ message }: {
    readonly message: Extract<TopicMessage, {
        role: 'context';
    }>;
}): import("react").JSX.Element;
