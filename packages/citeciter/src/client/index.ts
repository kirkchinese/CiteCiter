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
import { SelectionMenu } from './components/SelectionMenu.tsx'
import { UpdateNotice } from './components/UpdateNotice.tsx'
import { createAssistantEntry, createCiteCiterEntryRegistry, createToolEvidenceEntry } from './entries.ts'
import { installDynamicAccelerator } from './hotkeys.ts'
import { createReaderController } from './reader-controller.ts'
import { createSettingsDocumentController } from './settings-document.ts'
import { CiteBus } from './types.ts'
import { viewActions } from './view-actions.ts'
import { createUpdateController, INITIAL_UPDATE_SNAPSHOT } from './update-controller.ts'

export const name = '@kirkchinese/dsh-citeciter'
export const inject = ['slots', 'sessions', 'uiConversation', 'remote', 'remote.settings', 'settingsScope']

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
    )
    const reader = createReaderController(
      (request, signal) => remoteCtx.remote.citeciter.request(request, signal),
      companion,
    )
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
      companion.setSource(sessions.list.getSnapshot().current ?? null)
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
      const onContextMenu = (event: MouseEvent) => {
        const sourceSessionId = sessions.list.getSnapshot().current
        if (sourceSessionId === undefined) return
        const claim = entries.claim(event, { readChat, sourceSessionId })
        if (claim === null) return
        bus.setMenuSelection(claim.selection)
      }
      const onPointerDown = (event: PointerEvent) => {
        const target = event.target
        if (!(target instanceof Element) || target.closest('[data-citeciter-menu]') === null) {
          bus.setMenuSelection(null)
        }
      }
      const onKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') bus.setMenuSelection(null)
      }
      document.addEventListener('contextmenu', onContextMenu)
      document.addEventListener('pointerdown', onPointerDown)
      document.addEventListener('keydown', onKeyDown)
      return () => {
        disposeAssistantEntry()
        disposeToolEntry()
        document.removeEventListener('contextmenu', onContextMenu)
        document.removeEventListener('pointerdown', onPointerDown)
        document.removeEventListener('keydown', onKeyDown)
      }
    }, 'citeciter: selection capture')

    const companionActions = viewActions(companion)
    const readerActions = viewActions(reader)
    const updateActions = viewActions(updateController)
    const documentActions = viewActions(settingsDocument)
    const busActions = {
      setMenuSelection: bus.setMenuSelection.bind(bus),
      setPanelOpen: bus.setPanelOpen.bind(bus),
      requestBoardCitation: bus.requestBoardCitation.bind(bus),
      clearBoardCitation: bus.clearBoardCitation.bind(bus),
    }

    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.selection',
      inject: () => ({ bus: busActions, companion: companionActions, openPanel, hooks: { companion, overlay: bus } }),
    }, SelectionMenu))
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.panel',
      inject: () => ({ bus: busActions, companion: companionActions, closePanel, reportParseError, hooks: { companion, overlay: bus } }),
    }, CitePanel))
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.reader',
      inject: () => ({ reader: readerActions, hooks: { reader } }),
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
      await Promise.all([companion.dispose(), reader.dispose(), settingsDocument.dispose(), updateController.dispose()])
    }, 'citeciter: browser controller')
    void updateController.start()
  })
}
