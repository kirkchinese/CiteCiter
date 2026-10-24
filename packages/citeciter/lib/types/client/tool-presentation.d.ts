import type { TopicMessage } from '../topic.ts';
type ToolMessage = Extract<TopicMessage, {
    role: 'tool';
}>;
/** Title and one-line summary for a tool row; full arguments and result remain in its details. */
export declare function toolPresentation(message: ToolMessage): {
    readonly title: string;
    readonly summary: string;
    readonly running: boolean;
};
export {};
