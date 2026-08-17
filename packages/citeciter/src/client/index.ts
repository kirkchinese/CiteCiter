/**
 * CiteCiter browser plugin.
 *
 * Browser interaction path: assistant-text selection → right-click `Citer!`
 * menu (shell.overlay) → resizable right details panel → an isolated,
 * read-only forked explainer session.
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { SelectionMenu } from './components/SelectionMenu.tsx'
import { createExplainer } from './explainer.ts'
import { CitePanel } from './components/CitePanel.tsx'
import { readSelection } from './selection.ts'
import { CiteBus, type CiteSelection } from './types.ts'

/** Cordis identity for the CiteCiter browser plugin. */
export const name = '@kirkchinese/dsh-citeciter'

/** Hard dependencies whose appearance activates the browser fiber. */
export const inject = ['layout', 'slots', 'sessions']

/**
 * Register the selection listener, overlay entry, and details-panel lifecycle.
 * @param ctx - Cordis browser context with layout, slots, and sessions services.
 */
export function apply(ctx: Context): void {
  const { layout, sessions, slots } = ctx
  const bus = new CiteBus((error) => ctx.logger.warn('citeciter selection listener failed', error))
  const explainer = createExplainer(sessions)
  let detailsInjectController: (() => void) | null = null
  let detailsDisposer: (() => void) | null = null
  let panelOpen = false

  ctx.effect(() => {
    const onContextMenu = (event: MouseEvent) => {
      const selection = readSelection(event)
      if (selection === null) return
      event.preventDefault()
      bus.setMenuSelection(selection)
    }
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target
      if (!(target instanceof Element) || target.closest('[data-citeciter-menu]') === null) {
        bus.setMenuSelection(null)
      }
    }
    document.addEventListener('contextmenu', onContextMenu)
    document.addEventListener('pointerdown', onPointerDown)
    return () => {
      document.removeEventListener('contextmenu', onContextMenu)
      document.removeEventListener('pointerdown', onPointerDown)
    }
  })

  const openPanel = (selection: CiteSelection) => {
    bus.setPanelSelection(selection)
    panelOpen = true
    layout.openDetails()
    if (detailsInjectController === null) {
      detailsInjectController = slots.inject('details', () => {
        detailsDisposer = slots.register({
          name: 'details',
          // A single slot renders its lowest priority; closing disposes this shadow entry.
          priority: Number.MIN_SAFE_INTEGER,
          inject: () => ({ bus, close: closePanel, explainer }),
        }, CitePanel)
        return () => {
          detailsDisposer?.()
          detailsDisposer = null
        }
      })
    }
    void explainer.start(selection)
  }

  const closePanel = () => {
    const wasOpen = panelOpen
    panelOpen = false
    detailsDisposer?.()
    detailsDisposer = null
    detailsInjectController?.()
    detailsInjectController = null
    bus.setPanelSelection(null)
    if (wasOpen) layout.closeDetails()
  }

  ctx.effect(() => async () => {
    closePanel()
    await explainer.dispose()
  }, 'citeciter: explainer lifecycle')

  slots.inject('shell.overlay', () => slots.register({
    name: 'shell.overlay',
    id: 'citeciter.menu',
    inject: () => ({ bus, openPanel }),
  }, SelectionMenu))
}
