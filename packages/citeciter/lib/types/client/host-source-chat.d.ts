import type { Context } from '@deepseek-ai/cordis';
import type { ChatSnapshot } from '@deepseek-ai/dsh-client-ui-chat/client';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/**
 * Read the current Chat projection of a source already retained by the host UI.
 * @param ctx - Client context with the Session Controller and Conversation services.
 * @returns a synchronous reader; undefined means the source or Chat target is unavailable.
 * This borrows the Client generation without retaining it, opening history, or
 * changing the source log. DSH owns the derived Chat projection's lifetime.
 */
export declare function createSourceChatReader(ctx: Context): (sessionId: SessionId) => ChatSnapshot | undefined;
