/** CiteCiter browser entry: selection question, private Topic dock, and settings page. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import { SessionId } from '@deepseek-ai/dsh-session/types'
import type {} from '@deepseek-ai/dsh-client-ui-renderer/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import type {} from '@deepseek-ai/dsh-api-settings-controller/remote'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  CITECITER_SETTINGS_NAMESPACE,
  type CiteCiterSettings,
} from '../topic.ts'
import { TYPERT_REMOTE } from '../typert.remote-client.ts'
import { createCompanionController, INITIAL_COMPANION_SNAPSHOT } from './companion-controller.ts'
import { BlackboardWorkspace } from './components/BlackboardWorkspace.tsx'
import { CitePanel } from './components/CitePanel.tsx'
import { CiteCiterSettings as CiteCiterSettingsView, CiterPluginConfig } from './components/CiteCiterSettings.tsx'
import { DocumentTab } from './components/DocumentTab.tsx'
import { createDocumentLibrary } from './document-library.ts'
import { DOCUMENT_ADDRESS_PATTERN, DOCUMENT_TAB_ID, DOCUMENT_TAB_KIND, documentAddress, documentIdFromAddress } from './document-address.ts'
import { localizedWheelSlots } from '../actions.ts'
import { createActionExecutor } from './action-executor.ts'
import { createActionController } from './action-controller.ts'
import { createSelectionSurfaces, installWheelGesture } from './wheel-gesture.ts'
import { installSelectionToolbar } from './selection-toolbar.ts'
import { ActionWheel } from './components/ActionWheel.tsx'
import { SelectionToolbar } from './components/SelectionToolbar.tsx'
import { NativeLearningDocument } from './components/NativeLearningDocument.tsx'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client'
import { CiteLauncher } from './components/CiteLauncher.tsx'
import { UpdateNotice } from './components/UpdateNotice.tsx'
import { createAssistantEntry, createCiteCiterEntryRegistry, createToolEvidenceEntry, readUserMessageQuote } from './entries.ts'
import { insertMainQuote, installQuoteSource } from './main-quote.ts'
import { installQuoteRendering } from './user-text-quote.ts'
import { installDynamicAccelerator } from './hotkeys.ts'
import { createSettingsDocumentController } from './settings-document.ts'
import { CiteBus } from './types.ts'
import { createNativeComposer } from './native-composer.ts'
import { bindSubmissionPreference } from './submission-preference.ts'
import { viewActions } from './view-actions.ts'
import { createUpdateController, INITIAL_UPDATE_SNAPSHOT } from './update-controller.ts'
import { createBoardCaptureController } from './board-capture-controller.ts'
import { BoardCaptureWorker } from './components/BoardCaptureWorker.tsx'
import { createDraftController } from './draft-controller.ts'
import { hostSettings, hostInteractions } from './host-ui-adapter.ts'
import { createSourceChatReader } from './host-source-chat.ts'
import { createFileOpener } from './native-file-link.ts'
import type {} from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type {} from '@deepseek-ai/dsh-client-ui-plugin-manager/client'
import { CiterIcon, CiterTab } from './components/CiterTab.tsx'
import { installLocale, isChinese, t } from './i18n.ts'

/** Registry id and kind of Citer's right-sidebar tab type. */
const CITER_TAB_ID = '@kirkchinese/dsh-citeciter'
const CITER_TAB_KIND = 'citeciter'

export const name = '@kirkchinese/dsh-citeciter'
export const inject = ['slots', 'sessions', 'uiSession', 'uiConversation', 'remote', 'remote.settings', 'remote.session', 'remote.commands', 'remote.userQuestions', 'conversation']

/** Register one root-scoped companion without entering DSH's Session list. */
export async function apply(ctx: Context): Promise<void> {
  const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE)
  ctx.effect(() => unmountRemote, 'citeciter: Remote contribution')
  installLocale(ctx)
  installQuoteSource(ctx)
  installQuoteRendering(ctx)

  ctx.inject(['remote.citeciter'], (remoteCtx) => {
    const readChat = createSourceChatReader(remoteCtx)
    const settingsBinder = hostSettings(remoteCtx)
    const interactions = hostInteractions(remoteCtx)
    const settings = settingsBinder.get<CiteCiterSettings>(CITECITER_SETTINGS_NAMESPACE)
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
    const openFile = createFileOpener(remoteCtx)
    const drafts = createDraftController(async request => {
      const response = await remoteCtx.remote.citeciter.request(request)
      if (!response.ok) throw new Error(response.error.message)
      if (response.value.kind === 'deleted') {
        if (!('topicSessionId' in request) || response.value.sessionId !== request.topicSessionId) throw new Error(t('settings.error.deletedReceipt'))
        nativeComposer.retire(response.value.sessionId)
        throw new Error(t('settings.error.topicDeleted'))
      }
      return response.value
    }, nativeComposer, () => document.hasFocus())
    remoteCtx.effect(() => () => drafts.dispose(), 'citeciter: durable drafts')
    remoteCtx.effect(() => nativeComposer.onRetired(sessionId => drafts.forget(sessionId)), 'citeciter: retired Topic drafts')
    remoteCtx.effect(() => {
      const beforeUnload = (event: BeforeUnloadEvent) => {
        if (!drafts.hasUnsavedChanges() && !nativeComposer.hasUnsavedQuestionDrafts()) return
        void drafts.flushAll()
        void nativeComposer.flushQuestionDrafts()
        event.preventDefault()
        event.returnValue = ''
      }
      const visibility = () => {
        if (document.visibilityState !== 'hidden') return
        void drafts.flushAll()
        void nativeComposer.flushQuestionDrafts()
      }
      window.addEventListener('beforeunload', beforeUnload)
      document.addEventListener('visibilitychange', visibility)
      return () => {
        window.removeEventListener('beforeunload', beforeUnload)
        document.removeEventListener('visibilitychange', visibility)
      }
    }, 'citeciter: draft navigation guard')
    const capture = createBoardCaptureController(async (request, signal) => {
      const response = await remoteCtx.remote.citeciter.request(request, signal)
      if (!response.ok) throw new Error(response.error.message)
      return response.value
    }, error => remoteCtx.logger.warn('CiteCiter board capture failed', error))
    remoteCtx.effect(() => () => capture.dispose(), 'citeciter: background board capture')
    const submissionPreference = bindSubmissionPreference(remoteCtx)
    const bus = new CiteBus((error) => remoteCtx.logger.warn('CiteCiter browser listener failed', error))
    // Set while DSH's right sidebar hosts Citer as a tab; otherwise Citer's own overlay opens.
    let openTab: ((presentation: import('../actions.ts').PanelPresentation) => void) | undefined
    const openPanel = () => {
      if (openTab !== undefined) openTab(bus.getSnapshot().presentation)
      else bus.setPanelOpen(true)
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
    const library = createDocumentLibrary((request, signal) => remoteCtx.remote.citeciter.request(request, signal))
    void library.refresh()
    // Set while DSH's right sidebar opens library documents as tabs; otherwise Citer's panel shows them.
    let openDocumentTab: ((documentId: string, offset?: number) => void) | undefined
    const openDocument = (documentId: string, offset?: number) => {
      if (openDocumentTab !== undefined && bus.getSnapshot().host === 'tab') {
        openDocumentTab(documentId, offset)
        return
      }
      bus.showDocument(documentId, offset)
      bus.setPanelOpen(true)
    }
    const documentActions: import('./view-actions.ts').DocumentActions = {
      open: openDocument,
      load: library.load,
      remove: library.remove,
      refresh: library.refresh,
      importFile: async (file) => {
        const imported = await library.importFile(file)
        if (imported !== null) openDocument(imported.documentId)
      },
    }
    const surfaces = createSelectionSurfaces()
    const execute = createActionExecutor(companion, library, presentation => {
      bus.setPresentation(presentation)
      openPanel()
    })
    const actions = createActionController(execute, () => companion.getSnapshot().settings.defaultCiterModel ?? undefined)
    const openActions = (source: import('./action-controller.ts').ActionSource, x: number, y: number) => actions.open(source, x, y, localizedWheelSlots(companion.getSnapshot().settings.wheelSlots, isChinese()), false)
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

    const currentSession = remoteCtx.uiSession.adapter.current
    const readSource = () => {
      const key = currentSession.getSnapshot().key
      return key === undefined ? null : SessionId(key)
    }
    const entries = createCiteCiterEntryRegistry()
    /** Owned surfaces first, then the conversation entries, for both the wheel and the toolbar. */
    const readSelectionSource = (event: MouseEvent): import('./action-controller.ts').ActionSource | null => {
      const owned = surfaces.read(event.target)
      if (owned !== null) return owned
      const sourceSessionId = readSource()
      if (sourceSessionId === null) return null
      const userQuote = readUserMessageQuote(event, { readChat, sourceSessionId })
      if (userQuote !== null) return userQuote
      const claim = entries.claim(event, { readChat, sourceSessionId })
      return claim === null ? null : { kind: 'conversation', selection: claim.selection, quoteText: window.getSelection()?.toString().trim().slice(0, 32_000) || claim.selection.displayText }
    }
    const toolbar = installSelectionToolbar(
      { range: readSelectionSource, surface: event => surfaces.read(event.target) },
      () => companion.getSnapshot().settings.selectionToolbar ?? true,
    )
    remoteCtx.effect(() => () => toolbar.dispose(), 'citeciter: selection toolbar')

    const syncSource = () => {
      const source = readSource()
      if (companion.getSnapshot().sourceSessionId !== source) {
        actions.cancel()
        toolbar.dismiss()
      }
      companion.setSource(source)
    }
    syncSource()
    const unsubscribeSessions = currentSession.subscribe(syncSource)

    remoteCtx.effect(() => {
      const disposeAssistantEntry = remoteCtx.effect(
        () => entries.register(createAssistantEntry()),
        'citeciter: assistant selection entry',
      )
      const disposeToolEntry = remoteCtx.effect(
        () => entries.register(createToolEvidenceEntry()),
        'citeciter: tool evidence entry',
      )
      const disposeGesture = installWheelGesture(actions, readSelectionSource, () => {
        const current = companion.getSnapshot().settings
        return { ...current, wheelSlots: [...localizedWheelSlots(current.wheelSlots, isChinese())] }
      })
      return () => { disposeGesture(); disposeAssistantEntry(); disposeToolEntry() }
    }, 'citeciter: selection capture')

    const companionActions = viewActions(companion)
    const libraryActions = viewActions(library)
    const updateActions = viewActions(updateController)
    const settingsDocumentActions = viewActions(settingsDocument)
    const busActions = {
      setPanelOpen: bus.setPanelOpen.bind(bus),
      holdTabVisible: bus.holdTabVisible.bind(bus),
      setPresentation: bus.setPresentation.bind(bus),
      requestBoardCitation: bus.requestBoardCitation.bind(bus),
      clearBoardCitation: bus.clearBoardCitation.bind(bus),
      closeDocument: bus.closeDocument.bind(bus),
    }

    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay', id: 'citeciter.board-capture',
      inject: () => ({ reply: capture.reply, hooks: { capture } }),
    }, BoardCaptureWorker))
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay', id: 'citeciter.wheel',
      inject: () => ({ actions: viewActions(actions), hooks: { actions, companion } }),
    }, ActionWheel))
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay', id: 'citeciter.selection-toolbar',
      inject: () => ({ toolbar: { dismiss: toolbar.dismiss, run: actions.run, quote: async (source: import('./action-controller.ts').ActionSource) => {
        if (source.kind === 'conversation') insertMainQuote(remoteCtx, source.selection.sourceSessionId, {
          from: source.selection.kind === 'tool-result' ? 'tool' : 'assistant',
          text: source.quoteText ?? source.selection.displayText,
        })
        else if (source.kind === 'quote') insertMainQuote(remoteCtx, source.sourceSessionId, { from: 'user', text: source.displayText })
        else await execute.quote(source)
      } }, hooks: { toolbar, companion } }),
    }, SelectionToolbar))
    remoteCtx.inject(['documentPreviews'], previewCtx => {
      const id = '@kirkchinese/dsh-citeciter/learning-document'
      previewCtx.effect(() => previewCtx.documentPreviews.register({
        id, extensions: ['txt', 'md', 'markdown', 'ts', 'tsx', 'mts', 'cts', 'js', 'jsx', 'mjs', 'cjs', 'json', 'py', 'rs', 'go', 'c', 'cpp', 'h', 'css', 'yaml', 'yml', 'toml', 'sh', 'ps1'],
        priority: 'builtin', title: () => t('settings.native.title'), loading: 'bytes-complete', wrap: true,
      }), 'citeciter: native learning metadata')
      previewCtx.slots.inject('sidebar.right.tab.document', () => previewCtx.slots.register({
        name: 'sidebar.right.tab.document', key: id,
        inject: () => ({ registerSurface: surfaces.register, openActions }),
      }, NativeLearningDocument))
    })
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.launcher',
      inject: () => ({ openPanel, companion: companionActions, hooks: { companion, overlay: bus } }),
    }, CiteLauncher))
    const panelInject = () => ({ nativeComposer, drafts: viewActions(drafts), bus: busActions, companion: companionActions, closePanel, documents: documentActions, reportParseError, registerSurface: surfaces.register, openFile, hooks: { drafts, companion, overlay: bus, submission: submissionPreference, interactions, library } })
    // Citer's own dock, for hosts without DSH's right sidebar; it renders nothing while a tab hosts Citer.
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.panel',
      inject: panelInject,
    }, CitePanel))
    // Citer as a DSH right-sidebar tab, beside files, terminals and other plugins' tabs.
    remoteCtx.inject(['sidebarRight', 'sidebarRightTabs'], (sideCtx) => {
      sideCtx.effect(() => sideCtx.sidebarRightTabs.register({
        id: CITER_TAB_ID,
        kind: CITER_TAB_KIND,
        title: () => t('settings.title'),
        guide: [{ id: 'citeciter', order: 25, title: () => t('settings.title'), description: () => t('settings.guide.description'), icon: CiterIcon }],
      }), 'citeciter: sidebar tab type')
      sideCtx.slots.inject('sidebar.right.pane.tab', () => sideCtx.slots.register({
        name: 'sidebar.right.pane.tab',
        key: CITER_TAB_ID,
        inject: panelInject,
      }, CiterTab))
      // Library documents open as resource tabs: one tab per document, reopened at a new place.
      sideCtx.effect(() => sideCtx.sidebarRightTabs.register({
        id: DOCUMENT_TAB_ID,
        kind: DOCUMENT_TAB_KIND,
        patterns: [DOCUMENT_ADDRESS_PATTERN],
        // A visited document keeps its place while hidden, and closes itself when it is deleted.
        keepMounted: true,
        title: (address) => {
          const documentId = documentIdFromAddress(address)
          return (documentId === undefined ? undefined : library.title(documentId)) ?? t('settings.reader.title')
        },
      }), 'citeciter: document tab type')
      sideCtx.slots.inject('sidebar.right.pane.tab', () => sideCtx.slots.register({
        name: 'sidebar.right.pane.tab',
        key: DOCUMENT_TAB_ID,
        inject: () => ({ library: libraryActions, registerSurface: surfaces.register, sourceSessionId: () => companion.getSnapshot().sourceSessionId, hooks: { library } }),
      }, DocumentTab))
      openDocumentTab = (documentId, offset) => {
        try {
          sideCtx.sidebarRight.openResource(documentAddress(documentId), offset === undefined ? {} : { params: { offset } })
        } catch (error) {
          remoteCtx.logger.warn('Citer could not open a document tab', error)
        }
      }
      sideCtx.effect(() => () => { openDocumentTab = undefined }, 'citeciter: document tabs')
      const openSidebarTab = (presentation: import('../actions.ts').PanelPresentation) => {
        try {
          // A floating action opens beside the current tab instead of taking its place.
          sideCtx.sidebarRight.openTab(CITER_TAB_KIND, presentation === 'floating' ? { preferNewPane: true } : {})
        } catch (error) {
          // No Session is on screen to host the tab, such as while a global page fills the main column.
          remoteCtx.logger.warn('Citer could not open its sidebar tab', error)
        }
      }
      // The user may keep Citer's own panel instead; a Citer tab opened then hands over to it.
      const followPanelSetting = () => {
        const standalone = settings.getSnapshot().value?.standalonePanel === true
        const { host, panelOpen, presentation } = bus.getSnapshot()
        openTab = standalone ? undefined : openSidebarTab
        bus.setHost(standalone ? 'overlay' : 'tab')
        // An open standalone panel continues in the sidebar.
        if (!standalone && host === 'overlay' && panelOpen) openSidebarTab(presentation)
      }
      bus.setSidebarAvailable(true)
      followPanelSetting()
      sideCtx.effect(() => settings.subscribe(followPanelSetting), 'citeciter: panel host setting')
      sideCtx.effect(() => () => {
        openTab = undefined
        bus.setHost('overlay')
        bus.setSidebarAvailable(false)
      }, 'citeciter: sidebar host')
    })
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.update-notice',
      inject: () => ({ updateController: updateActions, hooks: { update: updateController } }),
    }, UpdateNotice))
    remoteCtx.slots.inject('conversation.view', () => remoteCtx.slots.register({
      name: 'conversation.view',
      id: 'citeciter.blackboard',
      order: 30,
      label: () => t('settings.blackboard.title'),
      inject: () => ({ companion: companionActions, bus: busActions, openPanel, hooks: { companion } }),
    }, BlackboardWorkspace))
    const settingsInject = () => ({ companion: companionActions, settingsDocument: settingsDocumentActions, updateController: updateActions, hooks: { companion, document: settingsDocument, update: updateController, overlay: bus } })
    remoteCtx.slots.inject('settings.section', () => remoteCtx.slots.register({
      name: 'settings.section',
      id: 'citeciter',
      order: 45,
      label: () => t('settings.title'),
      inject: settingsInject,
    }, CiteCiterSettingsView))
    // The same settings on Citer's own page in DSH's plugin manager.
    remoteCtx.slots.inject('plugins.bundle.config', () => remoteCtx.slots.register({
      name: 'plugins.bundle.config',
      key: name,
      inject: settingsInject,
    }, CiterPluginConfig))

    remoteCtx.effect(() => async () => {
      unsubscribeSessions()
      disposeHotkey()
      closePanel()
      await Promise.all([actions.dispose(), companion.dispose(), library.dispose(), settingsDocument.dispose(), updateController.dispose()])
    }, 'citeciter: browser controller')
    void updateController.start()
  })
}
