import type { Context } from '@deepseek-ai/cordis';
import type { ComposerAttachment, DraftAttachmentId, DraftFileUploads } from '@deepseek-ai/dsh-client-ui-conversation/client';
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { SessionFace } from '@deepseek-ai/dsh-api-session-controller/client';
import { type CiterSessionSnapshot } from './citer-session-face.ts';
export type DeliveryMode = 'queue' | 'steer';
/** A lost transport response is not proof that the host rejected a submission. */
export declare class UncertainSubmissionError extends Error {
}
export interface NativeComposer {
    readonly uploads: ObservableSnapshot<DraftFileUploads>;
    retry(sessionId: string, id: DraftAttachmentId): void;
    watch(sessionId: string, listener: (snapshot: CiterSessionSnapshot) => void): () => void;
    queue(sessionId: string, id: Parameters<SessionFace['updateQueue']>[0], action: Parameters<SessionFace['updateQueue']>[1]): Promise<void>;
    /** Read an image or file through its owning Session's attachment authorization. */
    attachment(sessionId: string, id: string): Promise<Blob>;
    add(sessionId: string, files: readonly File[]): Promise<readonly ComposerAttachment[]>;
    remove(id: DraftAttachmentId): void;
    send(sessionId: string, text: string, attachments: readonly DraftAttachmentId[], mode: DeliveryMode, requestId?: string): Promise<void>;
}
/** Adapt the installed conversation service's published composer methods; never reach its private input machine. */
export declare function createNativeComposer(ctx: Context): NativeComposer;
