/** Host entry for private Observer Topics and their browser Remote API. */
import { Service, type Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-fs'
import type {} from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-session-query'
import { settingsNamespace } from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-settings'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import z from '@deepseek-ai/schemastery'
import { TopicRuntime } from './topic-runtime.ts'
import {
  CITECITER_SETTINGS_NAMESPACE,
  DEFAULT_CITECITER_SETTINGS,
  citeCiterRequestSchema,
  citeCiterSettingsSchema,
  type CiteCiterRequest,
  type CiteCiterResponse,
  type CiteCiterSettings,
} from './topic.ts'

/** Cordis/Typert package identity. */
export const name = '@kirkchinese/dsh-citeciter'
/** Services required by the private Topic runtime. */
export const inject = ['llm', 'sessionQuery'] as const

/** Host settings identity shared with the browser settings scope. */
export const CITECITER_SETTINGS_NS = settingsNamespace(CITECITER_SETTINGS_NAMESPACE)

/** Native settings schema for new Topics and the companion panel. */
export const CITECITER_SETTINGS_SCHEMA = z.object({
  defaultMode: z.union(['observer', 'exact-when-available']).default(DEFAULT_CITECITER_SETTINGS.defaultMode),
  includeSourceReasoning: z.boolean().default(DEFAULT_CITECITER_SETTINGS.includeSourceReasoning),
  allowSourceFiles: z.boolean().default(DEFAULT_CITECITER_SETTINGS.allowSourceFiles),
  panelWidthPercent: z.number().step(1).min(28).max(55).default(DEFAULT_CITECITER_SETTINGS.panelWidthPercent),
  reopenLastTopic: z.boolean().default(DEFAULT_CITECITER_SETTINGS.reopenLastTopic),
})

function currentSettings(ctx: Context): CiteCiterSettings {
  const raw = ctx.get('settings')?.get(CITECITER_SETTINGS_NS)
  const parsed = citeCiterSettingsSchema.safeParse(raw)
  return parsed.success ? parsed.data : DEFAULT_CITECITER_SETTINGS
}

/** Root-scoped Remote service owning one isolated DSH runtime. */
export class CiteCiterHost extends TypertRemoteService {
  static inject = inject

  private readonly topics: TopicRuntime

  constructor(ctx: Context) {
    super(ctx, 'citeciter')
    this.topics = new TopicRuntime(ctx, () => currentSettings(ctx))
    ctx.effect(() => async () => this.topics.dispose(), 'citeciter: private Topic runtime')
  }

  /** Do not publish the Remote service until its private runtime is ready. */
  async [Service.init](): Promise<void> {
    await this.topics.initialize()
  }

  /** Validate and execute one strict Topic command. */
  @Remote('request')
  async request(rawRequest: CiteCiterRequest): Promise<CiteCiterResponse> {
    return this.topics.request(citeCiterRequestSchema.parse(rawRequest) as CiteCiterRequest)
  }
}

/** Register optional settings and mount the Host Remote service. */
export async function apply(ctx: Context): Promise<void> {
  ctx.inject(['settings'], (settingsCtx) => {
    settingsCtx.settings.register(CITECITER_SETTINGS_NS, CITECITER_SETTINGS_SCHEMA)
  })
  await ctx.plugin(CiteCiterHost)
}

export type {
  CiteCiterRequest,
  CiteCiterResponse,
  CiteCiterSettings,
  CitationDraft,
  CitationRecord,
  TopicSnapshot,
  TopicSummary,
} from './topic.ts'

export default CiteCiterHost
