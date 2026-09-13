import { Context } from '@deepseek-ai/cordis'
import type SessionStore from '@deepseek-ai/dsh-session'
import type { Session, SessionId } from '@deepseek-ai/dsh-session'
import type { CiterSessionAccess } from './citer-session-access.ts'

/** Own live Topic membership without advertising it as a root Host conversation. */
export function createCiterSessionStore(Base: typeof SessionStore, access: CiterSessionAccess): new (ctx: Context, fallback: { readonly store: SessionStore }) => SessionStore {
  return class CiterSessionStore extends Base {
    private readonly publishing = new Set<Session>()

    constructor(ctx: Context, private readonly fallback: { readonly store: SessionStore }) { super(ctx) }

    /** Native object lookups may still address a genuine source Session; enumeration remains local. */
    override get(id: SessionId): Session | undefined { return super.get(id) ?? this.fallback.store.get(id) }

    override enter(session: Session): () => void {
      const subject = session as Session & { [Context.filter]?: (ctx: Context) => boolean }
      const previous = subject[Context.filter]
      // scopeTarget captures this public Cordis filter during enter(). Only the
      // creation announcement stays in this store's realm. Event/projection and
      // flush listeners retain DSH's existing agent-scope routing thereafter.
      subject[Context.filter] = target => (previous?.call(session, target) ?? true)
        && (!this.publishing.has(session) || this[Context.filter](target))
      let detach: () => void
      let release: (() => void) | undefined
      try { detach = super.enter(session) }
      catch (error) { restore(); throw error }
      try { release = access.enter(session, this) }
      catch (error) { detach(); restore(); throw error }
      function restore() {
        if (previous === undefined) delete subject[Context.filter]
        else subject[Context.filter] = previous
      }
      return () => { try { detach() } finally { release?.(); restore() } }
    }

    /** Publish once to the owning realm; root navigation must never receive a Citer added row. */
    override announce(session: Session): void {
      this.publishing.add(session)
      try { super.announce(session) } finally { this.publishing.delete(session) }
    }
  }
}
