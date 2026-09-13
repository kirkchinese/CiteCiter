import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Session } from '@deepseek-ai/dsh-session';
import type { NativeState } from './native-session-contract.ts';
/** Read native inbox occurrences and requested admission receipts without registering a Host list row. */
export declare function readNativeState(agent: Agent, requestIds: readonly string[]): NativeState;
/** Authorize an image against this exact owned log before reading DSH's immutable attachment store. */
export declare function readNativeImage(ctx: Context, session: Session, id: string, signal: AbortSignal): Promise<{
    attachment: import("@deepseek-ai/dsh-attachment").ImageAttachmentRef;
    data: string;
}>;
