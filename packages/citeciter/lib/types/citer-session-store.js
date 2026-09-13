import { Context } from '@deepseek-ai/cordis';
/** Own live Topic membership without advertising it as a root Host conversation. */
export function createCiterSessionStore(Base, access) {
    return class CiterSessionStore extends Base {
        fallback;
        publishing = new Set();
        constructor(ctx, fallback) {
            super(ctx);
            this.fallback = fallback;
        }
        /** Native object lookups may still address a genuine source Session; enumeration remains local. */
        get(id) { return super.get(id) ?? this.fallback.store.get(id); }
        enter(session) {
            const subject = session;
            const previous = subject[Context.filter];
            // scopeTarget captures this public Cordis filter during enter(). Only the
            // creation announcement stays in this store's realm. Event/projection and
            // flush listeners retain DSH's existing agent-scope routing thereafter.
            subject[Context.filter] = target => (previous?.call(session, target) ?? true)
                && (!this.publishing.has(session) || this[Context.filter](target));
            let detach;
            let release;
            try {
                detach = super.enter(session);
            }
            catch (error) {
                restore();
                throw error;
            }
            try {
                release = access.enter(session, this);
            }
            catch (error) {
                detach();
                restore();
                throw error;
            }
            function restore() {
                if (previous === undefined)
                    delete subject[Context.filter];
                else
                    subject[Context.filter] = previous;
            }
            return () => { try {
                detach();
            }
            finally {
                release?.();
                restore();
            } };
        }
        /** Publish once to the owning realm; root navigation must never receive a Citer added row. */
        announce(session) {
            this.publishing.add(session);
            try {
                super.announce(session);
            }
            finally {
                this.publishing.delete(session);
            }
        }
    };
}
