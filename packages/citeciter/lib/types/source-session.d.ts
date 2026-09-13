import type { Context } from '@deepseek-ai/cordis';
import { type Session } from '@deepseek-ai/dsh-session';
import type { ObserverSourceSnapshot } from './observer.ts';
/** Read one consistent source cut. Release the observation even when copying fails. */
export declare function readSourceSession(ctx: Context, id: string): Promise<ObserverSourceSnapshot>;
/** Only an explicitly sent attachment enables later tool reads; unsent metadata grants nothing. */
export declare function hasSentSource(session: Session | undefined, address: string): boolean;
