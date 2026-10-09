import type { Context } from '@deepseek-ai/cordis';
import type { SessionFace, SessionSnapshot } from '@deepseek-ai/dsh-api-session-controller/client';
import { type SessionId } from '@deepseek-ai/dsh-session/types';
import type { MessageId } from '@deepseek-ai/dsh-llm';
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller/types';
import type { NativeState } from '../native-session-contract.ts';
/** Native control state plus Citer's read-only view of the authoritative inbox. */
export interface CiterSessionSnapshot extends SessionSnapshot {
    readonly modelSelectionRequired?: boolean;
    readonly queue: readonly (NativeState['queue'][number] & {
        id: MessageId;
        messageId: MessageId;
        rpcId?: SessionRequestId;
        content: import('@deepseek-ai/dsh-llm').ContentBlock[];
        preview: string;
    })[];
}
type Submission = Parameters<SessionFace['beginSubmission']>[0];
/** Own the published SessionFace contract for Citer navigation. Sending, uploads and inbox mutations remain native DSH operations. */
export declare class CiterSessionFace implements SessionFace {
    private readonly ctx;
    readonly sessionId: SessionId;
    private readonly onDeleted?;
    private readonly store;
    private readonly pending;
    private readonly lifetime;
    private readonly emptyProjection;
    readonly projections: {
        faceOf: (_key: string) => import("@deepseek-ai/dsh-client-store").SnapshotStore<unknown>;
    };
    private observers;
    private timer;
    private refreshing;
    private nextRequestId;
    /** Use the draft's durable identity for this explicit send, including retries after restart. */
    prepareSubmission(requestId: string): void;
    constructor(ctx: Context, sessionId: SessionId, onDeleted?: (() => void) | undefined);
    getSnapshot: () => CiterSessionSnapshot;
    subscribe: (listener: () => void) => (() => void);
    /** Establish ownership and obtain a real baseline before accepting composer work. */
    ready(): Promise<void>;
    private patch;
    private retire;
    beginSubmission(input: Submission): {
        requestId: SessionRequestId;
        abandon: () => void;
    };
    prompt: SessionFace['prompt'];
    /** Generic Citer attachment read; the installed SessionFace verb only supports images. */
    readCiterAttachment: (attachmentId: string) => Promise<{
        readonly ok: false;
        readonly error: import("@deepseek-ai/dsh-typert-protocol").RemoteFailure;
    } | {
        ok: true;
        value: {
            attachment: import("@deepseek-ai/dsh-attachment").ImageAttachmentRef | {
                attachmentId: import("@deepseek-ai/dsh-attachment").AttachmentId;
                name: string;
                bytes: number;
            };
            data: Uint8Array<ArrayBuffer>;
        };
    }>;
    readAttachment: SessionFace['readAttachment'];
    updateQueue: SessionFace['updateQueue'];
    cancel: SessionFace['cancel'];
    rename: SessionFace['rename'];
    command: SessionFace['command'];
    loadOlder: () => Promise<void>;
    loadThrough: () => Promise<void>;
    private schedule;
    private refresh;
    /** Stop polling and settle each owned submission exactly once when its owner closes or confirms deletion. */
    dispose(): void;
}
export {};
