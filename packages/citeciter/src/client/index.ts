/** CiteCiter browser entry: selection question, private Topic dock, and settings page. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-api-settings-controller/remote'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  CITECITER_SETTINGS_NAMESPACE,
  citeCiterSettingsSchema,
  type CiteCiterSettings,
} from '../topic.ts'
import { TYPERT_REMOTE } from '../typert.remote-client.ts'
import { createCompanionController, INITIAL_COMPANION_SNAPSHOT } from './companion-controller.ts'
import { BlackboardWorkspace } from './components/BlackboardWorkspace.tsx'
import { CitePanel } from './components/CitePanel.tsx'
import { CiteCiterSettings as CiteCiterSettingsView } from './components/CiteCiterSettings.tsx'
import { DocumentReader } from './components/DocumentReader.tsx'
import { DEFAULT_WHEEL_SLOTS } from '../actions.ts'
import { createActionExecutor } from './action-executor.ts'
import { createActionController } from './action-controller.ts'
import { createSelectionSurfaces, installWheelGesture } from './wheel-gesture.ts'
import { ActionWheel } from './components/ActionWheel.tsx'
import { NativeLearningDocument } from './components/NativeLearningDocument.tsx'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client'
import { CiteLauncher } from './components/CiteLauncher.tsx'
import { UpdateNotice } from './components/UpdateNotice.tsx'
import { createAssistantEntry, createCiteCiterEntryRegistry, createToolEvidenceEntry } from './entries.ts'
import { installDynamicAccelerator } from './hotkeys.ts'
import { createReaderController } from './reader-controller.ts'
import { createSettingsDocumentController } from './settings-document.ts'
import { CiteBus } from './types.ts'
import { createNativeComposer } from './native-composer.ts'
import { bindSubmissionPreference } from './submission-preference.ts'
import { viewActions } from './view-actions.ts'
import { createUpdateController, INITIAL_UPDATE_SNAPSHOT } from './update-controller.ts'

export const name = '@kirkchinese/dsh-citeciter'
export const inject = ['slots', 'sessions', 'uiSession', 'uiConversation', 'remote', 'remote.settings', 'remote.session', 'remote.commands', 'settingsScope', 'conversation']

function decodeSettings(section: unknown): CiteCiterSettings | undefined {
  const parsed = citeCiterSettingsSchema.safeParse(section)
  return parsed.success ? parsed.data : undefined
}

/** Register one root-scoped companion without entering DSH's Session list. */
export async function apply(ctx: Context): Promise<void> {
  const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE)
  ctx.effect(() => unmountRemote, 'citeciter: Remote contribution')

  ctx.inject(['remote.citeciter'], (remoteCtx) => {
    const sessions = remoteCtx.sessions
    const readChat = (sessionId: SessionId) => {
      const source = sessions.binding(sessionId)
      if (source === undefined) return undefined
      const conversation = remoteCtx.uiConversation.binding(source)
      conversation.activate('chat')
      return conversation.target('chat').getSnapshot()
    }
    const settingsBinder = remoteCtx.settingsScope
    const settings = settingsBinder.bind({
      namespace: CITECITER_SETTINGS_NAMESPACE,
      decode: decodeSettings,
    })
    const settingsDocument = createSettingsDocumentController(
      settingsBinder.describe(),
      async (signal) => {
        const response = await remoteCtx.remote.settings.openSettingsDocument(signal)
        if (!response.ok) throw new Error(response.error.message)
      },
    )
    const updateController = createUpdateController(
      settings,
      async (signal) => {
        const response = await remoteCtx.remote.citeciter.checkUpdate(signal)
        if (!response.ok) throw new Error(response.error.message)
        const result = response.value
        if (result.kind === 'error') throw new Error(`CiteCiter update check failed: ${result.code}`)
        return result.updateAvailable
          ? { currentVersion: result.installedVersion, latestVersion: result.latestVersion, profile: result.profile ?? 'web' }
          : null
      },
      createSnapshotStore(INITIAL_UPDATE_SNAPSHOT),
      undefined,
      (error) => remoteCtx.logger.warn('CiteCiter update check failed', error),
    )
    const nativeComposer = createNativeComposer(remoteCtx)
    const submissionPreference = bindSubmissionPreference(remoteCtx)
    const bus = new CiteBus((error) => remoteCtx.logger.warn('CiteCiter browser listener failed', error))
    const openPanel = () => {
      bus.setPanelOpen(true)
    }
    const closePanel = () => {
      bus.setPanelOpen(false)
    }
    const disposeHotkey = installDynamicAccelerator(
      () => settings.getSnapshot().value?.shortcutOpenPanel,
      openPanel,
    )
    const companion = createCompanionController(
      readChat,
      settings,
      (request, signal) => remoteCtx.remote.citeciter.request(request, signal),
      openPanel,
      createSnapshotStore(INITIAL_COMPANION_SNAPSHOT),
      nativeComposer,
    )
    const reader = createReaderController(
      (request, signal) => remoteCtx.remote.citeciter.request(request, signal),
      companion,
    )
    const surfaces = createSelectionSurfaces()
    const actions = createActionController(createActionExecutor(companion, reader, presentation => {
      bus.setPresentation(presentation)
      openPanel()
    }), () => companion.getSnapshot().settings.defaultCiterModel ?? undefined)
    const openActions = (source: import('./action-controller.ts').ActionSource, x: number, y: number) => actions.open(source, x, y, companion.getSnapshot().settings.wheelSlots ?? DEFAULT_WHEEL_SLOTS, false)
    const reportedParseErrors = new Set<string>()
    const reportParseError = (messageId: string) => {
      const storageKey = `citeciter:malformed-followups:${messageId}`
      try {
        if (sessionStorage.getItem(storageKey) !== null) return
        sessionStorage.setItem(storageKey, '1')
      } catch {
        // Browser privacy settings may deny session storage; the in-memory set still deduplicates this page.
      }
      if (reportedParseErrors.has(messageId)) return
      reportedParseErrors.add(messageId)
      remoteCtx.logger.warn(`CiteCiter ignored malformed first-answer follow-up questions in ${messageId}`)
    }

    const syncSource = () => {
      const source = sessions.list.getSnapshot().current ?? null
      if (companion.getSnapshot().sourceSessionId !== source) actions.cancel()
      companion.setSource(source)
    }
    syncSource()
    const unsubscribeSessions = sessions.list.subscribe(syncSource)

    remoteCtx.effect(() => {
      const entries = createCiteCiterEntryRegistry()
      const disposeAssistantEntry = remoteCtx.effect(
        () => entries.register(createAssistantEntry()),
        'citeciter: assistant selection entry',
      )
      const disposeToolEntry = remoteCtx.effect(
        () => entries.register(createToolEvidenceEntry()),
        'citeciter: tool evidence entry',
      )
      const disposeGesture = installWheelGesture(actions, event => {
        const owned = surfaces.read(event.target)
        if (owned !== null) return owned
        const sourceSessionId = sessions.list.getSnapshot().current
        if (sourceSessionId === undefined) return null
        const claim = entries.claim(event, { readChat, sourceSessionId })
        return claim === null ? null : { kind: 'conversation', selection: claim.selection }
      }, () => companion.getSnapshot().settings)
      return () => { disposeGesture(); disposeAssistantEntry(); disposeToolEntry() }
    }, 'citeciter: selection capture')

    const companionActions = viewActions(companion)
    const readerActions = viewActions(reader)
    const updateActions = viewActions(updateController)
    const documentActions = viewActions(settingsDocument)
    const busActions = {
      setPanelOpen: bus.setPanelOpen.bind(bus),
      setPresentation: bus.setPresentation.bind(bus),
      requestBoardCitation: bus.requestBoardCitation.bind(bus),
      clearBoardCitation: bus.clearBoardCitation.bind(bus),
    }

    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay', id: 'citeciter.wheel',
      inject: () => ({ actions: viewActions(actions), companion: companionActions, hooks: { actions, companion } }),
    }, ActionWheel))
    remoteCtx.inject(['documentPreviews'], previewCtx => {
      const id = '@kirkchinese/dsh-citeciter/learning-document'
      previewCtx.effect(() => previewCtx.documentPreviews.register({
        id, extensions: ['txt', 'md', 'markdown', 'ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs', 'json', 'py', 'rs', 'go', 'c', 'cpp', 'h', 'css', 'yaml', 'yml', 'toml', 'sh', 'ps1'],
        priority: 'builtin', title: () => 'CiteCiter 学习', loading: 'bytes-complete', wrap: true,
      }), 'citeciter: native learning metadata')
      previewCtx.slots.inject('sidebar.right.tab.document', () => previewCtx.slots.register({
        name: 'sidebar.right.tab.document', key: id,
        inject: () => ({ registerSurface: surfaces.register, openActions }),
      }, NativeLearningDocument))
    })
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.launcher',
      inject: () => ({ openPanel, hooks: { companion, overlay: bus } }),
    }, CiteLauncher))
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.panel',
      inject: () => ({ nativeComposer, bus: busActions, companion: companionActions, closePanel, openReader: () => reader.setOpen(true), reportParseError, hooks: { companion, overlay: bus, submission: submissionPreference, interactions: remoteCtx.uiSession.pendingInteractions } }),
    }, CitePanel))
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.reader',
      inject: () => ({ reader: readerActions, registerSurface: surfaces.register, sourceSessionId: () => companion.getSnapshot().sourceSessionId, hooks: { reader, overlay: bus } }),
    }, DocumentReader))
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.update-notice',
      inject: () => ({ updateController: updateActions, hooks: { update: updateController } }),
    }, UpdateNotice))
    remoteCtx.slots.inject('conversation.view', () => remoteCtx.slots.register({
      name: 'conversation.view',
      id: 'citeciter.blackboard',
      order: 30,
      label: '小黑板',
      inject: () => ({ companion: companionActions, bus: busActions, openPanel, hooks: { companion } }),
    }, BlackboardWorkspace))
    remoteCtx.slots.inject('settings.section', () => remoteCtx.slots.register({
      name: 'settings.section',
      id: 'citeciter',
      order: 45,
      label: 'CiteCiter',
      inject: () => ({ companion: companionActions, settingsDocument: documentActions, updateController: updateActions, hooks: { companion, document: settingsDocument, update: updateController } }),
    }, CiteCiterSettingsView))

    remoteCtx.effect(() => async () => {
      unsubscribeSessions()
      disposeHotkey()
      closePanel()
      await Promise.all([actions.dispose(), companion.dispose(), reader.dispose(), settingsDocument.dispose(), updateController.dispose()])
    }, 'citeciter: browser controller')
    void updateController.start()
  })
}
