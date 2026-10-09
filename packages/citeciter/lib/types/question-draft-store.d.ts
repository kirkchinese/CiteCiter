import { type QuestionDraftRecord, type QuestionDraftState } from './question-draft-contract.ts';
/** Caller serializes all operations with Topic admission/deletion and verifies ownership of the Topic directory. */
export declare class QuestionDraftStore {
    private readonly topicDirectory;
    constructor(topicDirectory: string);
    private directory;
    private file;
    private readIfPresent;
    /** Read validated data bound to the exact key. Corrupt records remain intact and surface an error. */
    read(key: string): Promise<QuestionDraftRecord>;
    /** Register a real blocking call before any edit, preserving every existing draft and its CAS revision. */
    registerBlocking(key: string): Promise<QuestionDraftRecord>;
    /** List only validated records for restart reconciliation; unknown files are never consumed as drafts. */
    records(): Promise<QuestionDraftRecord[]>;
    private write;
    /** CAS returns the authoritative record on conflict; a closed record never accepts another save. */
    save(key: string, next: QuestionDraftState, blocking?: boolean): Promise<{
        state: QuestionDraftState;
        conflict: boolean;
        closed: boolean;
    }>;
    /**
     * Check the submitting window's saved revision inside the same Topic admission
     * operation that accepts its answer. A separate preflight GET cannot prevent a race.
     * @param expectedRevision - the saved version, or undefined for a legacy caller without a draft protocol.
     * Legacy callers are accepted only when this exact key has no persisted record.
     * @returns the authoritative conflict/closed record, or undefined when admission may proceed.
     */
    checkSubmission(key: string, expectedRevision: number | undefined): Promise<{
        state: QuestionDraftState;
        conflict: boolean;
        closed: boolean;
    } | undefined>;
    /** Called only after an exact Host admission or terminal outcome, never on timeout or Client disposal. */
    close(key: string, onlyExisting?: boolean): Promise<QuestionDraftRecord>;
    /** Permanently remove only recognized ordinary files after the owning Topic is retired. */
    remove(): Promise<void>;
}
