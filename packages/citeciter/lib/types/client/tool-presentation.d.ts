import type { TopicMessage } from '../topic.ts';
type ToolMessage = Extract<TopicMessage, {
    role: 'tool';
}>;
/**
 * Title and one-line summary for a tool row. The full arguments and result stay in its details.
 * @returns a readable title, the summary shown after it, and whether the call is still running.
 */
export declare function toolPresentation(message: ToolMessage): {
    readonly title: string;
    readonly summary: string;
    readonly running: boolean;
};
export {};
