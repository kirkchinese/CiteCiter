var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
/** Host entry for private Observer Topics and their browser Remote API. */
import { Service } from '@deepseek-ai/cordis';
import { settingsNamespace } from '@deepseek-ai/dsh-settings';
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import z from '@deepseek-ai/schemastery';
import { TopicRuntime } from "./topic-runtime.js";
import { UpdateChecker } from "./update.js";
import { CITECITER_SETTINGS_NAMESPACE, DEFAULT_CITECITER_SETTINGS, citeCiterRequestSchema, citeCiterSettingsSchema, } from "./topic.js";
/** Cordis/Typert package identity. */
export const name = '@kirkchinese/dsh-citeciter';
/** Services required by the private Topic runtime. */
export const inject = ['llm', 'sessionQuery', 'subprocess'];
/** Host settings identity shared with the browser settings scope. */
export const CITECITER_SETTINGS_NS = settingsNamespace(CITECITER_SETTINGS_NAMESPACE);
/** Native settings schema for new Topics and the companion panel. */
export const CITECITER_SETTINGS_SCHEMA = z.object({
    defaultMode: z.union(['observer', 'exact-when-available']).default(DEFAULT_CITECITER_SETTINGS.defaultMode),
    includeSourceReasoning: z.boolean().default(DEFAULT_CITECITER_SETTINGS.includeSourceReasoning),
    allowSourceFiles: z.boolean().default(DEFAULT_CITECITER_SETTINGS.allowSourceFiles),
    panelWidthPercent: z.number().step(1).min(28).max(55).default(DEFAULT_CITECITER_SETTINGS.panelWidthPercent),
    reopenLastTopic: z.boolean().default(DEFAULT_CITECITER_SETTINGS.reopenLastTopic),
    tutorPrompt: z.string().max(4000).default(''),
    followupQuestions: z.boolean().default(DEFAULT_CITECITER_SETTINGS.followupQuestions ?? true),
    promptTemplates: z.array(z.object({
        id: z.string().min(1).max(60),
        label: z.string().min(1).max(40),
        text: z.string().min(1).max(600),
    })).max(8).default([]),
    shortcutOpenPanel: z.string().max(40).default(''),
    boardAnimations: z.boolean().default(DEFAULT_CITECITER_SETTINGS.boardAnimations ?? true),
    updateNotifications: z.boolean().default(DEFAULT_CITECITER_SETTINGS.updateNotifications ?? true),
});
function currentSettings(ctx) {
    const raw = ctx.get('settings')?.get(CITECITER_SETTINGS_NS);
    const parsed = citeCiterSettingsSchema.safeParse(raw);
    return parsed.success ? parsed.data : DEFAULT_CITECITER_SETTINGS;
}
/** Root-scoped Remote service owning one isolated DSH runtime. */
let CiteCiterHost = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _request_decorators;
    let _checkUpdate_decorators;
    return class CiteCiterHost extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _request_decorators = [Remote('request')];
            _checkUpdate_decorators = [Remote('checkUpdate')];
            __esDecorate(this, null, _request_decorators, { kind: "method", name: "request", static: false, private: false, access: { has: obj => "request" in obj, get: obj => obj.request }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _checkUpdate_decorators, { kind: "method", name: "checkUpdate", static: false, private: false, access: { has: obj => "checkUpdate" in obj, get: obj => obj.checkUpdate }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = inject;
        topics = __runInitializers(this, _instanceExtraInitializers);
        updates = new UpdateChecker();
        service;
        releaseService;
        constructor(ctx) {
            super(ctx, 'citeciter');
            ctx.inject(['settings'], (settingsCtx) => {
                settingsCtx.settings.register(CITECITER_SETTINGS_NS, CITECITER_SETTINGS_SCHEMA);
            });
            this.topics = new TopicRuntime(ctx, () => currentSettings(ctx));
            this.service = {
                create: async (request, signal) => this.topicSnapshot(request, signal),
                ask: async (request, signal) => this.topicSnapshot(request, signal),
                get: async (topicSessionId, signal) => {
                    const response = await this.topics.request({ action: 'get', topicSessionId }, signal ?? new AbortController().signal);
                    if (response.kind !== 'topic')
                        throw new Error('CiteCiter returned a non-Topic response');
                    return response.topic;
                },
                list: async (sourceSessionId, includeArchived, signal) => {
                    const response = await this.topics.request({ action: 'list', sourceSessionId, includeArchived: includeArchived ?? false }, signal ?? new AbortController().signal);
                    if (response.kind !== 'topics')
                        throw new Error('CiteCiter returned a non-Topic-list response');
                    return response.topics;
                },
                delete: async (request, signal) => {
                    const response = await this.topics.request(request, signal ?? new AbortController().signal);
                    if (response.kind !== 'deleted')
                        throw new Error('CiteCiter returned a non-deletion response');
                    return response;
                },
            };
            this.releaseService = ctx.provide('citeciterRuntime', this.service);
            ctx.effect(() => async () => {
                const release = this.releaseService;
                this.releaseService = undefined;
                await release?.();
            }, 'citeciter: public Topic runtime service');
            ctx.effect(() => this.topics.onTopicChange((name, payload) => {
                if (name === 'deleted') {
                    ctx.emit('citeciter/topic-deleted', payload);
                }
                else {
                    ctx.emit(name === 'created' ? 'citeciter/topic-created' : 'citeciter/topic-updated', payload);
                }
            }), 'citeciter: topic change events');
            ctx.effect(() => async () => this.topics.dispose(), 'citeciter: private Topic runtime');
        }
        /** Do not publish the Remote service until its private runtime is ready. */
        async [Service.init]() {
            await this.topics.initialize();
        }
        /** Resolve one create/ask command into a committed Topic snapshot. */
        async topicSnapshot(request, signal) {
            const response = await this.topics.request(request, signal ?? new AbortController().signal);
            if (response.kind !== 'topic')
                throw new Error('CiteCiter returned a non-Topic response');
            return response.topic;
        }
        /** Validate and execute one strict Topic command. */
        async request(rawRequest, signal) {
            return this.topics.request(citeCiterRequestSchema.parse(rawRequest), signal);
        }
        /** Check npm for an installable stable version without changing this installation. */
        async checkUpdate(signal) {
            return this.updates.check(signal);
        }
    };
})();
export { CiteCiterHost };
/** Register optional settings and mount the Host Remote service. */
export async function apply(ctx) {
    await ctx.plugin(CiteCiterHost);
}
export { updateCheckErrorCodeSchema, updateCheckResponseSchema } from "./update.js";
export default CiteCiterHost;
