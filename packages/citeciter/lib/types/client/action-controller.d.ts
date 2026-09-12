import type { SessionId } from '@deepseek-ai/dsh-session/types';
import { type ActionModel, type CiteAction } from '../actions.ts';
import type { CiteSelection } from './types.ts';
/** Immutable capture from a conversation, imported document or native file preview. */
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
    } | null;
    question: string;
    submitting: boolean;
    error: string | null;
    model: ActionModel | undefined;
}
/** Direction around the actual displayed centre; no action inside the dead zone or outside the wheel. */
export declare function wheelSector(dx: number, dy: number): number | null;
/** Controller owns duplicate submission, retry drafts and source-change cancellation. Dispose with the Client. */
export declare function createActionController(execute: (source: ActionSource, action: CiteAction, question: string, model?: ActionModel) => Promise<void>, defaultModel?: () => ActionModel | undefined): {
    getSnapshot: () => ActionSnapshot;
    subscribe: (fn: () => void) => () => void;
    open(source: ActionSource, x: number, y: number, slots: readonly (CiteAction | null)[], held: boolean): void;
    move(x: number, y: number): void;
    focus(index: number): void;
    release(quick: boolean): void;
    /** Cancel only the transient gesture; a question draft belongs to its explicit close/source lifecycle. */
    dismissWheel(): void;
    choose: (index: number | null) => void;
    cancel: () => void;
    submit: () => Promise<void>;
    setModel(model: ActionModel | undefined): void;
    setQuestion(question: string): void;
    dispose(): Promise<void>;
};
export type ActionController = ReturnType<typeof createActionController>;
