import { type DraftFile, type DraftState } from './draft-contract.ts';
/** Caller serializes with Topic deletion and supplies an ownership-verified Topic directory. No model log is touched. */
export declare class DraftStore {
    private readonly topicDirectory;
    constructor(topicDirectory: string);
    private directory;
    private file;
    /** Read validated state. Missing drafts are empty; malformed drafts remain on disk and surface an error. */
    read(): Promise<DraftState>;
    /** Compare-and-swap state; conflict returns the authoritative draft without overwriting either client's input. */
    save(expected: number, next: Omit<DraftState, 'revision'>): Promise<{
        state: DraftState;
        conflict: boolean;
    }>;
    /** Reconcile an exact native admission receipt after a lost response or restart. */
    acknowledge(state: DraftState): Promise<DraftState>;
    /** Sequential bounded upload. Repeated identical chunks are safe after a lost response. */
    put(meta: DraftFile, offset: number, data: string): Promise<void>;
    /** Read only an attachment referenced by this exact saved draft, never an arbitrary path. */
    chunk(id: string, offset: number): Promise<string>;
    /** Delete only the verified draft subtree after the Topic is retired. */
    remove(): Promise<void>;
}
