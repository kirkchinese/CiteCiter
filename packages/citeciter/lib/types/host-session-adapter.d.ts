import type { Context } from '@deepseek-ai/cordis';
import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import type { CiteCiterSettings, TopicMetadata } from './topic.ts';
/** Host-owned session services; Citer owns only its scoped contributions and factory handles. */
export declare class HostSessionAdapter {
    private readonly ctx;
    private readonly settings;
    private readonly assemble;
    private readonly storageRoot;
    private readonly metadata;
    private readonly scopes;
    private readonly worlds;
    private readonly access;
    private disposal;
    constructor(ctx: Context, settings: () => CiteCiterSettings, assemble: (scope: Context, agent: Agent, metadata: TopicMetadata) => Promise<void>, storageRoot: (metadata: TopicMetadata) => string);
    /** Drain owned factories before removing their native checkpoint routes. */
    private dispose;
    /** Retain navigation metadata before the Host can resume this identity. */
    remember(metadata: TopicMetadata): void;
    /** Resolve the Topic's own factory and persistence realm below its source directory. */
    context(metadata: TopicMetadata): Promise<Context>;
    /** Release a complete owned Topic realm before deleting its files. */
    retire(metadata: TopicMetadata): Promise<void>;
    /** Compose a Topic on a native Agent without replacing its loop, tools or permission service. */
    private attach;
    /**
     * Create a native Session with an explicit initial permission. It starts without
     * inherited history, so references removed from a draft cannot leak into model input.
     * No prompt is sent here.
     */
    create(metadata: TopicMetadata, signal?: AbortSignal): Promise<AgentHandle>;
    /** Resume with the Host's preset and preserve the user's logged permission. */
    resume(metadata: TopicMetadata, signal?: AbortSignal): Promise<AgentHandle>;
}
