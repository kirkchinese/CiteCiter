import type { ContentBlock } from '@deepseek-ai/dsh-llm';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
interface ContextSource {
    kind: string;
    plugin?: string;
    form?: unknown;
    citer?: unknown;
    summary?: unknown;
    [field: string]: unknown;
}
interface ContextMessage {
    id: string;
    content: readonly ContentBlock[];
    source: ContextSource;
}
/** Projected presentation of one logged non-user message, following DSH's context producer model. */
export interface ContextPresentation extends ContextMessage {
    /** Row title. */
    label: string;
    /** `recall` for material lifted out of another session, `inject` for every other producer. */
    contextRole: 'inject' | 'recall';
    /** Producer named by the durable source, or null when it carries no readable kind. */
    producer: string | null;
    /** One-line account a `notice` records for its collapsed row. */
    summary?: string;
}
/** Citer's own form of a message it appended: the `citer` field, or the legacy `form` of earlier versions. */
export declare function citerMessageForm(source: {
    readonly kind: string;
} & Record<string, unknown>): string | undefined;
/** Project the installed SDK's validated log. 0.1.7 split plugin context into developer/message. */
export declare function contextMessage(event: SessionEvent): ContextPresentation | undefined;
export {};
