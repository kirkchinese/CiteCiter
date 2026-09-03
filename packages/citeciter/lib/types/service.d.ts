/** Public CiteCiter host service face (`ctx.citeciterRuntime`; `ctx.citeciter` stays the Typert Remote service) for other DSH plugins. */
import type { CiteCiterRequest, CiteCiterResponse, TopicSnapshot, TopicSummary } from './topic.ts';
declare module '@deepseek-ai/cordis' {
    interface Context {
        citeciterRuntime?: CiteCiterService;
    }
    interface Events {
        /**
         * A new Topic committed its metadata and answered its first question.
         * @param payload.topic - the durable Topic summary.
         * @mode emit
         */
        'citeciter/topic-created'(payload: {
            topic: TopicSummary;
        }): void;
        /**
         * An existing Topic committed a state change (follow-up, stop, rename,
         * archive, or model route change).
         * @param payload.topic - the durable Topic summary.
         * @mode emit
         */
        'citeciter/topic-updated'(payload: {
            topic: TopicSummary;
        }): void;
        /**
         * A Topic was logically deleted; physical owner cleanup may still be pending.
         * @param payload - deleted Topic identity and independent cleanup outcome.
         * @mode emit
         */
        'citeciter/topic-deleted'(payload: Omit<Extract<CiteCiterResponse, {
            kind: 'deleted';
        }>, 'kind'>): void;
    }
}
/** Command-style v1 host API: the same validated surface the browser Remote exposes. */
export interface CiteCiterService {
    /**
     * Create one source-bound Topic, with or without a validated evidence claim.
     * @param request - strict source or evidence create command.
     * @param signal - caller cancellation.
     * @returns the committed Topic snapshot.
     */
    create(request: Extract<CiteCiterRequest, {
        action: 'create';
    }>, signal?: AbortSignal): Promise<TopicSnapshot>;
    /**
     * Submit one follow-up question to a Topic.
     * @param request - strict ask command.
     * @param signal - caller cancellation.
     * @returns the committed Topic snapshot.
     */
    ask(request: Extract<CiteCiterRequest, {
        action: 'ask';
    }>, signal?: AbortSignal): Promise<TopicSnapshot>;
    /**
     * Read one Topic snapshot.
     * @param topicSessionId - private Topic Session identity.
     * @param signal - caller cancellation.
     * @returns the current Topic snapshot.
     */
    get(topicSessionId: string, signal?: AbortSignal): Promise<TopicSnapshot>;
    /**
     * List Topics grouped by their source session.
     * @param sourceSessionId - source DSH Session identity.
     * @param includeArchived - include archived Topics when true.
     * @param signal - caller cancellation.
     * @returns summaries sorted by update time descending.
     */
    list(sourceSessionId: string, includeArchived?: boolean, signal?: AbortSignal): Promise<TopicSummary[]>;
    /**
     * Permanently delete one Topic from CiteCiter's private JSONL store.
     * @param request - strict delete command carrying the repeated target identity.
     * @param signal - caller cancellation before logical deletion commits.
     * @returns logical deletion identity and physical cleanup outcome.
     */
    delete(request: Extract<CiteCiterRequest, {
        action: 'delete';
    }>, signal?: AbortSignal): Promise<Extract<CiteCiterResponse, {
        kind: 'deleted';
    }>>;
}
