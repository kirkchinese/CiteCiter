import type { SessionId } from '@deepseek-ai/dsh-session/types';
import { type ActionModel, type CiteAction } from '../actions.ts';
import type { CiteSelection } from './types.ts';
/** Immutable capture from a conversation, imported document, native file preview or a Topic's own transcript. */
export type ActionSource = {
    readonly kind: 'conversation';
    readonly selection: CiteSelection;
} | {
    readonly kind: 'document';
    readonly sourceSessionId: SessionId;
    readonly displayText: string;
    readonly prefixText: string;
    readonly suffixText: string;
    readonly title: string;
    readonly documentId?: string;
    readonly content?: string;
} | {
    /** Text selected in a Topic's own answers or tool output; actions continue that Topic. */
    readonly kind: 'topic';
    readonly sourceSessionId: SessionId;
    readonly topicSessionId: string;
    readonly displayText: string;
};
export declare const actionSourceSession: (source: ActionSource) => SessionId;
export declare const actionSourceQuote: (source: ActionSource) => string;
export interface WheelSnapshot {
    readonly source: ActionSource;
    readonly x: number;
    readonly y: number;
    readonly active: number | null;
    readonly slots: readonly (CiteAction | null)[];
    readonly held: boolean;
    readonly scale: number;
}
export interface ActionSnapshot {
    wheel: WheelSnapshot | null;
    pending: {
        readonly source: ActionSource;
        readonly action: CiteAction;
        readonly x: number;
        readonly y: number;
        readonly newTopic: boolean;
    } | null;
    submitting: boolean;
    error: string | null;
    model: ActionModel | undefined;
}
/** Direction around the actual displayed centre; no action inside the dead zone or outside the wheel. */
export declare function wheelSector(dx: number, dy: number): number | null;
/**
 * Run a chosen action through the executor: the selected Topic by default, a new Topic on request.
 * Questions the user writes go to the composer; preset prompts follow the delivery setting.
 */
export declare function createActionController(execute: (source: ActionSource, action: CiteAction, question: string, model?: ActionModel, options?: {
    readonly newTopic?: boolean;
}) => Promise<void>, defaultModel?: () => ActionModel | undefined): {
    getSnapshot: () => ActionSnapshot;
    subscribe: (fn: () => void) => () => void;
    open(source: ActionSource, x: number, y: number, slots: readonly (CiteAction | null)[], held: boolean): void;
    move(x: number, y: number): void;
    focus(index: number): void;
    release(quick: boolean): void;
    /** Focus loss cancels only the transient gesture; the Topic composer retains its draft. */
    dismissWheel(): void;
    choose: (index: number | null) => void;
    run: (source: ActionSource, action: CiteAction, x: number, y: number, newTopic?: boolean) => void;
    cancel: () => void;
    submit: () => Promise<void>;
    dispose(): Promise<void>;
};
export type ActionController = ReturnType<typeof createActionController>;
