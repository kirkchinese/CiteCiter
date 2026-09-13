import type { Context } from '@deepseek-ai/cordis';
import type { Session } from '@deepseek-ai/dsh-session';
/**
 * Read an image or verbatim file only after finding its reference in this Topic.
 * @param ctx - the owned Agent context supplying the native attachment store.
 * @param session - the exact Citer log authorizing the requested identity.
 * @param id - opaque attachment identity; never interpreted as a filesystem path.
 * @param signal - cancellation propagated to the host reader.
 * @returns the durable image/file reference and base64 bytes for the remote client.
 * Native readers retain byte-integrity checks. The browser materializes the complete
 * attachment for preview/download; this operation never reads the source Session.
 */
export declare function readNativeAttachment(ctx: Context, session: Session, id: string, signal: AbortSignal): Promise<{
    attachment: import("@deepseek-ai/dsh-attachment").ImageAttachmentRef;
    data: string;
} | {
    attachment: import("@deepseek-ai/dsh-attachment").FileAttachmentRef;
    data: string;
}>;
