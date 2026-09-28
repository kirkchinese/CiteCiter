import type { TopicMessage } from '../../topic.ts';
import type { NativeComposer } from '../native-composer.ts';
/** Show returned files immediately while keeping diagnostic arguments and results collapsible. */
export declare function ToolRow({ message, sessionId, load }: {
    readonly message: Extract<TopicMessage, {
        role: 'tool';
    }>;
    readonly sessionId: string;
    readonly load: NativeComposer['attachment'];
}): import("react").JSX.Element;
