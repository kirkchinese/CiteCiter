import type { Context } from '@deepseek-ai/cordis';
import type { SessionFace, SessionSnapshot } from '@deepseek-ai/dsh-api-session-controller/client';
import { type SessionId } from '@deepseek-ai/dsh-session/types';
import type { SessionRequestId } from '@deepseek-ai/dsh-api-session-controller/types';
type Submission = Parameters<SessionFace['beginSubmission']>[0];
/** Own the published SessionFace contract for Citer navigation. Sending, uploads and inbox mutations remain native DSH operations. */
export declare class CiterSessionFace implements SessionFace {
    private readonly ctx;
    readonly sessionId: SessionId;
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
    constructor(ctx: Context, sessionId: SessionId);
    getSnapshot: () => SessionSnapshot;
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
    readAttachment: SessionFace['readAttachment'];
    updateQueue: SessionFace['updateQueue'];
    cancel: SessionFace['cancel'];
    rename: SessionFace['rename'];
    command: SessionFace['command'];
    loadOlder: () => Promise<void>;
    loadThrough: () => Promise<void>;
    private schedule;
    private refresh;
    /** Stop polling and settle each owned submission exactly once when its plugin closes. */
    dispose(): void;
}
export {};
