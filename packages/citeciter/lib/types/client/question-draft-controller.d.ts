import { type QuestionDraftContent, type QuestionDraftState } from '../question-draft-contract.ts';
export interface QuestionDraftResult {
    readonly state: QuestionDraftState;
    readonly conflict?: boolean;
    readonly closed?: boolean;
}
/** The caller binds this port to one exact Topic/question key. It must never submit an answer. */
export interface QuestionDraftPort {
    get(): Promise<QuestionDraftResult>;
    save(state: QuestionDraftState): Promise<QuestionDraftResult>;
}
export interface QuestionDraftView {
    readonly content: QuestionDraftContent;
    readonly ready: boolean;
    readonly closed: boolean;
    readonly error: string | null;
}
/**
 * Keep question editing synchronous while serializing revision-checked background saves.
 * The owning question carrier outlives its React card. Disposal flushes but never submits,
 * and only an authoritative Host outcome may finish this draft before disposal.
 */
export declare function createQuestionDraftController(port: QuestionDraftPort, isOperating: () => boolean): {
    getSnapshot: () => QuestionDraftView;
    subscribe: (listener: () => void) => () => void;
    ensure: () => Promise<void>;
    flush: () => Promise<void>;
    /** Bind manual submission to this window's saved version; the Host checks it atomically with acceptance. */
    prepareSubmission: () => Promise<number>;
    /** Preserve local answers when another window saved after our last edit or flush. */
    rejectSubmission: (result: QuestionDraftResult) => Promise<void>;
    /** Keep remote reconciliation out of an unfinished input-method composition. */
    setComposing: (value: boolean) => void;
    /** Echo edits before returning to React; persistence is deliberately deferred. */
    setAnswers: (answers: Readonly<Record<string, {
        readonly selected: readonly string[];
        readonly custom: string;
    }>>) => void;
    setPage: (page: number) => void;
    setWaitState: (next: {
        readonly edited?: boolean;
        readonly held?: boolean;
    }) => void;
    hasUnsavedChanges: () => boolean;
    /** Invalidate pending acknowledgements after the Host confirms acceptance or termination. */
    finish: () => void;
    /** Flush local edits without deleting the durable draft or submitting an answer. */
    dispose: () => Promise<void>;
};
export type QuestionDraftController = ReturnType<typeof createQuestionDraftController>;
