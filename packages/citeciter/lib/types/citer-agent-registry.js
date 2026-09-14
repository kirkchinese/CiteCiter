import AgentRegistry from '@deepseek-ai/dsh-agent';
/** Own a separate factory while publishing live identities through DSH's public registry for its conversation, upload and queue APIs. */
export class CiterAgentRegistry extends AgentRegistry {
    options;
    constructor(ctx, options) {
        super(ctx);
        this.options = options;
    }
    enter(agent, owner) { return this.options.registry.enter(agent, owner); }
    announce(agent) { this.options.registry.announce(agent); }
    register(agent) { return this.options.registry.register(agent); }
    get(id) { return this.options.registry.get(id); }
    list() { return this.options.registry.list(); }
    roots() { return this.options.registry.roots(); }
    isOwnedBy(id, owner) { return this.options.registry.isOwnedBy(id, owner); }
    currentInitiator() { return this.options.registry.currentInitiator(); }
    requireInitiator() { return this.options.registry.requireInitiator(); }
    withInitiator(agent, operation) { return this.options.registry.withInitiator(agent, operation); }
    withoutInitiator(operation) { return this.options.registry.withoutInitiator(operation); }
}
