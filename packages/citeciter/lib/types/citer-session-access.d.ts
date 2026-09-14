import type { Context } from '@deepseek-ai/cordis';
import type SessionStore from '@deepseek-ai/dsh-session';
import type { Session } from '@deepseek-ai/dsh-session';
/** Bridge native checkpoints and identity lookups to owned stores without adding their members to Host enumeration. */
export declare class CiterSessionAccess {
    private readonly owners;
    /** Install one reversible adapter for this plugin's lifetime. No Host files or Agent Loop methods change. */
    constructor(ctx: Context, drain: () => Promise<void>);
    /** Register after native enter; unregister after native detach, including failed publication. */
    enter(session: Session, store: SessionStore): () => void;
}
