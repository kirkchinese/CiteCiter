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
import { CITECITER_SETTINGS_NAMESPACE, DEFAULT_CITECITER_SETTINGS, citeCiterRequestSchema, citeCiterSettingsSchema, } from "./topic.js";
/** Cordis/Typert package identity. */
export const name = '@kirkchinese/dsh-citeciter';
/** Services required by the private Topic runtime. */
export const inject = ['llm', 'sessionQuery'];
/** Host settings identity shared with the browser settings scope. */
export const CITECITER_SETTINGS_NS = settingsNamespace(CITECITER_SETTINGS_NAMESPACE);
/** Native settings schema for new Topics and the companion panel. */
export const CITECITER_SETTINGS_SCHEMA = z.object({
    defaultMode: z.union(['observer', 'exact-when-available']).default(DEFAULT_CITECITER_SETTINGS.defaultMode),
    includeSourceReasoning: z.boolean().default(DEFAULT_CITECITER_SETTINGS.includeSourceReasoning),
    allowSourceFiles: z.boolean().default(DEFAULT_CITECITER_SETTINGS.allowSourceFiles),
    panelWidthPercent: z.number().step(1).min(28).max(55).default(DEFAULT_CITECITER_SETTINGS.panelWidthPercent),
    reopenLastTopic: z.boolean().default(DEFAULT_CITECITER_SETTINGS.reopenLastTopic),
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
    return class CiteCiterHost extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _request_decorators = [Remote('request')];
            __esDecorate(this, null, _request_decorators, { kind: "method", name: "request", static: false, private: false, access: { has: obj => "request" in obj, get: obj => obj.request }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = inject;
        topics = __runInitializers(this, _instanceExtraInitializers);
        constructor(ctx) {
            super(ctx, 'citeciter');
            this.topics = new TopicRuntime(ctx, () => currentSettings(ctx));
            ctx.effect(() => async () => this.topics.dispose(), 'citeciter: private Topic runtime');
        }
        /** Do not publish the Remote service until its private runtime is ready. */
        async [Service.init]() {
            await this.topics.initialize();
        }
        /** Validate and execute one strict Topic command. */
        async request(rawRequest) {
            return this.topics.request(citeCiterRequestSchema.parse(rawRequest));
        }
    };
})();
export { CiteCiterHost };
/** Register optional settings and mount the Host Remote service. */
export async function apply(ctx) {
    ctx.inject(['settings'], (settingsCtx) => {
        settingsCtx.settings.register(CITECITER_SETTINGS_NS, CITECITER_SETTINGS_SCHEMA);
    });
    await ctx.plugin(CiteCiterHost);
}
export default CiteCiterHost;
