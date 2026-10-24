import type { Context } from '@deepseek-ai/cordis';
import type { UserMessage } from '@deepseek-ai/dsh-llm';
import { type Session, type SessionEvent } from '@deepseek-ai/dsh-session';
import type { ObserverSourceSnapshot } from './observer.ts';
/** The pending model selector stored by rc.3, independently of the last executed request. */
export declare function selectedSourceModel(events: readonly SessionEvent[]): {
    provider: string;
    model: string;
    reasoningEffort?: string;
} | undefined;
/** Read one consistent source cut. Release the observation even when copying fails. */
export declare function readSourceSession(ctx: Context, id: string): Promise<ObserverSourceSnapshot>;
/** Whether a source or document address was actually sent, for attachment-scoped resources. */
export declare function hasSentSource(session: Session | undefined, address: string): boolean;
/** Whether one user-sent message carries the source address. */
export declare function mentionsSource(message: Pick<UserMessage, 'source' | 'content'>, address: string): boolean;
