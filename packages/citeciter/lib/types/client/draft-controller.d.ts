import type { ComposerAttachment } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { CiteCiterRequest, CiteCiterResponse } from '../topic.ts';
import { type DraftContent, type DraftFile } from '../draft-contract.ts';
import { type DraftReference } from './draft-references.ts';
import type { NativeComposer } from './native-composer.ts';
export interface DraftView {
    readonly content: DraftContent;
    readonly files: readonly ComposerAttachment[];
    readonly missing: readonly DraftFile[];
    readonly ready: boolean;
    readonly saving: boolean;
    readonly sending: boolean;
    readonly conflict: boolean;
    readonly pending: boolean;
    readonly error: string | null;
}
export type DraftSnapshot = Readonly<Record<string, DraftView>>;
export declare const EMPTY_DRAFT_VIEW: DraftView;
type Request = (request: CiteCiterRequest) => Promise<CiteCiterResponse>;
/** Own draft persistence and attachment lifetimes independently of panel mounting and Topic navigation. */
export declare function createDraftController(request: Request, native: NativeComposer): {
    getSnapshot: () => Readonly<Record<string, DraftView>>;
    subscribe: (listener: () => void) => () => void;
    /** Pending receipts are already durable; only unflushed local edits need a navigation warning. */
    hasUnsavedChanges: () => boolean;
    flushAll: () => Promise<PromiseSettledResult<void>[]>;
    ensure: (id: string) => Promise<void>;
    flush: (id: string) => Promise<void>;
    setText: (id: string, text: string) => Promise<void>;
    append: (id: string, text: string, references: readonly DraftReference[]) => Promise<void>;
    removeReference: (id: string, referenceId: string) => Promise<void>;
    addFiles: (id: string, files: readonly File[]) => Promise<void>;
    removeFile: (id: string, fileId: string) => Promise<void>;
    /** Persist the exact outgoing snapshot and identity before native submission begins. */
    submit: (id: string, send: (content: DraftContent, files: readonly ComposerAttachment[], requestId: string) => Promise<boolean>, retry?: boolean) => Promise<boolean>;
    reload: (id: string) => Promise<void>;
    /** Check a lost send response without replacing edits made while the check is in flight. */
    reconcile: (id: string) => Promise<void>;
    /** Explicit conflict resolution: restore locally retained bytes removed by a peer, then CAS the latest revision. */
    keepLocal: (id: string) => Promise<void>;
    forget: (id: string) => void;
    dispose: () => Promise<void>;
};
export type DraftController = ReturnType<typeof createDraftController>;
export {};
