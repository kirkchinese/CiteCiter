/** Host entry for native Topics, legacy compatibility and the browser Remote API. */
import { Service, type Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-fs'
import type {} from '@deepseek-ai/dsh-llm'
import type {} from '@deepseek-ai/dsh-session-query'
import type {} from '@deepseek-ai/dsh-settings'
import type {} from '@deepseek-ai/dsh-subprocess'
import { Remote, TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol'
import z from '@deepseek-ai/schemastery'
import { TopicRuntime } from './topic-runtime.ts'
import type { CiteCiterService } from './service.ts'
import { UpdateChecker, type UpdateCheckResponse } from './update.ts'
import { DEFAULT_WHEEL_SLOTS } from './actions.ts'
import {
  CITECITER_SETTINGS_NAMESPACE,
  DEFAULT_CITECITER_SETTINGS,
  citeCiterRequestSchema,
  citeCiterSettingsSchema,
  type CiteCiterRequest,
  type CiteCiterResponse,
  type CiteCiterSettings,
  type TopicSnapshot,
} from './topic.ts'

/** Cordis/Typert package identity. */
export const name = '@kirkchinese/dsh-citeciter'
/** Explicit dependencies for native session composition and legacy compatibility. */
export const inject = ['llm', 'sessionQuery', 'subprocess', 'agents', 'agentPresets', 'sessionController', 'systemPrompt', 'tools', 'sandboxPolicy', 'sessions', 'sessionPersistence', 'sessionTitle', 'attachments'] as const

/** Host settings identity shared with the browser settings scope. */
export const CITECITER_SETTINGS_NS = CITECITER_SETTINGS_NAMESPACE

/** Native settings schema for new Topics and the companion panel. */
export const CITECITER_SETTINGS_SCHEMA: z<object> = z.object({
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
  activeRecall: z.boolean().default(DEFAULT_CITECITER_SETTINGS.activeRecall ?? false),
  defaultPermission: z.union(['read-only', 'workspace-write', 'danger-full-access']).default('read-only'),
  learningRoute: z.boolean().default(false),
  updateNotifications: z.boolean().default(DEFAULT_CITECITER_SETTINGS.updateNotifications ?? true),
  wheelTrigger: z.union(['right-button', 'Alt', 'Control', 'Shift', 'Meta']).default('right-button'),
  defaultCiterModel: z.union([z.const(null), z.object({ provider: z.string().min(1).max(200), model: z.string().min(1).max(200) })]).default(null),
  wheelSlots: z.array(z.union([z.const(null), z.object({
    label: z.string().min(1).max(20),
    prompt: z.string().max(4000),
    ask: z.boolean(),
    scenario: z.union(['qa', 'present']),
    presentation: z.union(['side', 'floating']),
  })])).min(8).max(8).default([...DEFAULT_WHEEL_SLOTS]),
})

function currentSettings(ctx: Context): CiteCiterSettings {
  const raw = ctx.get('settings')?.get(CITECITER_SETTINGS_NS)
  const parsed = citeCiterSettingsSchema.safeParse(raw)
  return parsed.success ? parsed.data : DEFAULT_CITECITER_SETTINGS
}

/** Root-scoped Remote service owning Topic metadata, native contributions and a legacy runtime. */
export class CiteCiterHost extends TypertRemoteService {
  static inject = inject

  private readonly topics: TopicRuntime
  private readonly updates = new UpdateChecker()
  private readonly service: CiteCiterService
  private releaseService: (() => void) | undefined

  constructor(ctx: Context) {
    super(ctx, 'citeciter')
    ctx.inject(['settings'], (settingsCtx) => {
      settingsCtx.settings.register(CITECITER_SETTINGS_NS, CITECITER_SETTINGS_SCHEMA)
    })
    this.topics = new TopicRuntime(ctx, () => currentSettings(ctx))
    this.service = {
      create: async (request, signal) => this.topicSnapshot(request, signal),
      ask: async (request, signal) => this.topicSnapshot(request, signal),
      get: async (topicSessionId, signal) => {
        const response = await this.topics.request({ action: 'get', topicSessionId }, signal ?? new AbortController().signal)
        if (response.kind !== 'topic') throw new Error('CiteCiter returned a non-Topic response')
        return response.topic
      },
      list: async (sourceSessionId, includeArchived, signal) => {
        const response = await this.topics.request(
          { action: 'list', sourceSessionId, includeArchived: includeArchived ?? false },
          signal ?? new AbortController().signal,
        )
        if (response.kind !== 'topics') throw new Error('CiteCiter returned a non-Topic-list response')
        return response.topics
      },
      delete: async (request, signal) => {
        const response = await this.topics.request(request, signal ?? new AbortController().signal)
        if (response.kind !== 'deleted') throw new Error('CiteCiter returned a non-deletion response')
        return response
      },
    }
    this.releaseService = ctx.provide('citeciterRuntime', this.service)
    ctx.effect(() => async () => {
      const release = this.releaseService
      this.releaseService = undefined
      await release?.()
    }, 'citeciter: public Topic runtime service')
    ctx.effect(() => this.topics.onTopicChange((name, payload) => {
      if (name === 'deleted') {
        ctx.emit('citeciter/topic-deleted', payload as Omit<Extract<CiteCiterResponse, { kind: 'deleted' }>, 'kind'>)
      } else {
        ctx.emit(name === 'created' ? 'citeciter/topic-created' : 'citeciter/topic-updated', payload as { topic: TopicSnapshot['topic'] })
      }
    }), 'citeciter: topic change events')
    ctx.effect(() => async () => this.topics.dispose(), 'citeciter: private Topic runtime')
  }

  /** Do not publish the Remote service until its private runtime is ready. */
  async [Service.init](): Promise<void> {
    await this.topics.initialize()
  }

  /** Resolve one create/ask command into a committed Topic snapshot. */
  private async topicSnapshot(
    request: Extract<CiteCiterRequest, { action: 'create' | 'ask' }>,
    signal?: AbortSignal,
  ): Promise<TopicSnapshot> {
    const response = await this.topics.request(request, signal ?? new AbortController().signal)
    if (response.kind !== 'topic') throw new Error('CiteCiter returned a non-Topic response')
    return response.topic
  }

  /** Validate and execute one strict Topic command. */
  @Remote('request')
  async request(rawRequest: CiteCiterRequest, signal: AbortSignal): Promise<CiteCiterResponse> {
    return this.topics.request(citeCiterRequestSchema.parse(rawRequest) as CiteCiterRequest, signal)
  }

  /** Check npm for an installable stable version without changing this installation. */
  @Remote('checkUpdate')
  async checkUpdate(signal: AbortSignal): Promise<UpdateCheckResponse> {
    const result = await this.updates.check(signal)
    // Desktop 2.x exports this immutable Host service; it never crosses into browser props.
    const desktop = this.ctx.get('desktopProfiles') as { readonly current: { readonly name: string } } | undefined
    return result.kind === 'success' && desktop !== undefined
      ? { ...result, profile: desktop.current.name }
      : result
  }
}

/** Register optional settings and mount the Host Remote service. */
export async function apply(ctx: Context): Promise<void> {
  await ctx.plugin(CiteCiterHost)
}

export type { CiteCiterService } from './service.ts'
export { updateCheckErrorCodeSchema, updateCheckResponseSchema } from './update.ts'
export type { UpdateCheckErrorCode, UpdateCheckResponse } from './update.ts'

export type {
  CiteCiterRequest,
  CiteCiterResponse,
  CiteCiterSettings,
  CitationSelectionClaim,
  CitationDraft,
  CitationEntry,
  CitationEvidence,
  CitationRecord,
  DocumentContent,
  DocumentEvidenceClaim,
  DocumentFormat,
  DocumentSummary,
  ToolEvidenceClaim,
  TopicMode,
  TopicScenario,
  TopicSnapshot,
  TopicSummary,
} from './topic.ts'

export default CiteCiterHost
