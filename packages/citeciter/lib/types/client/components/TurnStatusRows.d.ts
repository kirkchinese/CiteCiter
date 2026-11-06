import type { TopicMessage } from '../../topic.ts';
/**
 * One model-request retry chain, as DSH's transcript shows it: the attempt and its limit, a countdown
 * while it waits, and the delay and failure reason when expanded.
 */
export declare function RetryRow({ message, friendly }: {
    readonly message: Extract<TopicMessage, {
        role: 'retry';
    }>;
    readonly friendly: (text: string) => string;
}): import("react").JSX.Element;
/** A turn that failed or was stopped, as DSH's terminal turn row: a state dot, the outcome and its code. */
export declare function TurnErrorRow({ message, friendly }: {
    readonly message: Extract<TopicMessage, {
        role: 'error';
    }>;
    readonly friendly: (text: string) => string;
}): import("react").JSX.Element;
