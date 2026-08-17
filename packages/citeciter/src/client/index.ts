/**
 * CiteCiter browser plugin.
 *
 * Milestone 0 (this file): package skeleton + minimum path —
 * assistant-text selection → right-click `Citer!` menu (shell.overlay) →
 * resizable right details panel showing the resolved selection.
 * The explainer session pipeline is deliberately not wired yet.
 */
import type { Context } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-layout/client'
import { SelectionMenu } from './components/SelectionMenu.tsx'
import { createExplainer } from './explainer.ts'
import { CitePanel } from './components/CitePanel.tsx'
import { readSelection } from './selection.ts'
import { CiteBus, type CiteSelection } from './types.ts'

export const name = '@deepseek-ai/dsh-citeciter'

export const inject = ['layout', 'slots', 'sessions']

export function apply(ctx: Context): void {
  const { layout, sessions, slots } = ctx
  const bus = new CiteBus()
  const explainer = createExplainer(sessions)
  let detailsInjectController: (() => void) | null = null
  let detailsDisposer: (() => void) | null = null

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

  const freeDetailsPriority = () => {
    let next = -1
    for (const entry of slots.entries('details')) {
      const priority = entry.options.priority ?? 0
      if (priority <= next) next = priority - 1
    }
    return next
  }

  const openPanel = (selection: CiteSelection) => {
    bus.setPanelSelection(selection)
    layout.openDetails()
    if (detailsDisposer !== null) return
    detailsInjectController = slots.inject('details', () => {
      detailsDisposer = slots.register({
        name: 'details',
        priority: freeDetailsPriority(),
        inject: () => ({ bus, close: closePanel, explainer }),
      }, CitePanel)
      return () => {
        detailsDisposer?.()
        detailsDisposer = null
      }
    })
    void explainer.start(selection)
  }

  const closePanel = () => {
    detailsDisposer?.()
    detailsDisposer = null
    detailsInjectController?.()
    detailsInjectController = null
    bus.setPanelSelection(null)
    layout.closeDetails()
  }

  slots.inject('shell.overlay', () => slots.register({
    name: 'shell.overlay',
    id: 'citeciter.menu',
    inject: () => ({ bus, openPanel }),
  }, SelectionMenu))
}
