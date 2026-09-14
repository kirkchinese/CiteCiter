import { Context } from '@deepseek-ai/cordis';
import type SessionStore from '@deepseek-ai/dsh-session';
import type { CiterSessionAccess } from './citer-session-access.ts';
/** Own live Topic membership without advertising it as a root Host conversation. */
export declare function createCiterSessionStore(Base: typeof SessionStore, access: CiterSessionAccess): new (ctx: Context, fallback: {
    readonly store: SessionStore;
}) => SessionStore;
