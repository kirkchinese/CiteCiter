/** CiteCiter browser entry: selection question, private Topic dock, and settings page. */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-api-gateway/client'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
import { createSnapshotStore, type ISessions } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import {
  CITECITER_SETTINGS_NAMESPACE,
  citeCiterSettingsSchema,
  type CiteCiterSettings,
} from '../topic.ts'
import { TYPERT_REMOTE } from '../typert.remote-client.ts'
import { createCompanionController, INITIAL_COMPANION_SNAPSHOT } from './companion-controller.ts'
import { CitePanel } from './components/CitePanel.tsx'
import { CiteCiterSettings as CiteCiterSettingsView } from './components/CiteCiterSettings.tsx'
import { SelectionMenu } from './components/SelectionMenu.tsx'
import { createSettingsDocumentController } from './settings-document.ts'
import { claimSelectionContextMenu } from './selection.ts'
import { CiteBus } from './types.ts'

export const name = '@kirkchinese/dsh-citeciter'
export const inject = ['slots', 'sessions', 'remote', 'settingsScope', 'connection']

function decodeSettings(section: unknown): CiteCiterSettings | undefined {
  const parsed = citeCiterSettingsSchema.safeParse(section)
  return parsed.success ? parsed.data : undefined
}

/** Register one root-scoped companion without entering DSH's Session list. */
export async function apply(ctx: Context): Promise<void> {
  const unmountRemote = await ctx.remote.$mount(TYPERT_REMOTE)
  ctx.effect(() => unmountRemote, 'citeciter: Remote contribution')

  ctx.inject(['remote.citeciter'], (remoteCtx) => {
    const sessions = remoteCtx.get('sessions') as unknown as ISessions
    const settingsBinder = remoteCtx.settingsScope
    const settings = settingsBinder.bind({
      namespace: CITECITER_SETTINGS_NAMESPACE,
      decode: decodeSettings,
    })
    const connection = remoteCtx.get('connection') as ConnectionHandle
    const settingsDocument = createSettingsDocumentController(
      settingsBinder.describe(),
      async (signal) => {
        const response = await connection.api.settings.openDocument({}, signal)
        if (!response.result.ok) throw new Error(response.result.error.message)
      },
    )
    const bus = new CiteBus((error) => remoteCtx.logger.warn('CiteCiter browser listener failed', error))
    const openPanel = () => {
      bus.setPanelOpen(true)
    }
    const closePanel = () => {
      bus.setPanelOpen(false)
    }
    const companion = createCompanionController(
      sessions,
      settings,
      (request, signal) => remoteCtx.remote.citeciter.request(request, signal),
      openPanel,
      createSnapshotStore(INITIAL_COMPANION_SNAPSHOT),
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
      const onContextMenu = (event: MouseEvent) => {
        const sourceSessionId = sessions.list.getSnapshot().current
        if (sourceSessionId === undefined) return
        const selection = claimSelectionContextMenu(event, sourceSessionId)
        if (selection === null) return
        bus.setMenuSelection(selection)
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
        document.removeEventListener('contextmenu', onContextMenu)
        document.removeEventListener('pointerdown', onPointerDown)
        document.removeEventListener('keydown', onKeyDown)
      }
    }, 'citeciter: selection capture')

    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.selection',
      inject: () => ({ bus, companion, openPanel }),
    }, SelectionMenu))
    remoteCtx.slots.inject('shell.overlay', () => remoteCtx.slots.register({
      name: 'shell.overlay',
      id: 'citeciter.panel',
      inject: () => ({ bus, companion, closePanel, reportParseError }),
    }, CitePanel))
    remoteCtx.slots.inject('settings.section', () => remoteCtx.slots.register({
      name: 'settings.section',
      id: 'citeciter',
      order: 45,
      label: 'CiteCiter',
      inject: () => ({ companion, settingsDocument }),
    }, CiteCiterSettingsView))

    remoteCtx.effect(() => async () => {
      unsubscribeSessions()
      closePanel()
      await Promise.all([companion.dispose(), settingsDocument.dispose()])
    }, 'citeciter: browser controller')
  })
}
