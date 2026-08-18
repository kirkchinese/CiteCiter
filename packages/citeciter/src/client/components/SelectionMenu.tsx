import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import type { ExplainFace } from '../explainer.ts'
import type { CiteBus, CiteSelection } from '../types.ts'
import css from './CiteCiter.module.css'

const PREVIEW_LIMIT = 64

/** Dependencies injected into the root overlay entry. */
export interface SelectionMenuProps {
  readonly bus: CiteBus
  readonly explainer: ExplainFace
  readonly openPanel: (selection?: CiteSelection) => void
}

/**
 * Render the contextual `Citer!` action and a persistent Thread launcher.
 * @param props - shared selection bus, explainer state, and panel opener.
 * @returns shell-overlay controls.
 */
export function SelectionMenu({ bus, explainer, openPanel }: SelectionMenuProps) {
  const [selection, setSelection] = useState<CiteSelection | null>(() => bus.getMenuSelection())
  const subscribeExplainer = useCallback((listener: () => void) => explainer.subscribe(listener), [explainer])
  const snapshot = useSyncExternalStore(subscribeExplainer, explainer.getSnapshot)

  useEffect(() => bus.subscribe(() => {
    setSelection(bus.getMenuSelection())
  }), [bus])

  const preview = selection === null
    ? ''
    : selection.text.length > PREVIEW_LIMIT
      ? `${selection.text.slice(0, PREVIEW_LIMIT)}…`
      : selection.text

  return (
    <>
      {selection !== null && (
        <div
          className={css.menu}
          data-citeciter-menu
          style={{ left: selection.x, top: selection.y }}
          role="menu"
        >
          <span className={css.menuPreview} title={selection.text}>{preview}</span>
          <button
            className={css.menuButton}
            type="button"
            role="menuitem"
            onClick={() => {
              openPanel(selection)
              bus.setMenuSelection(null)
            }}
          >
            Citer!
          </button>
        </div>
      )}
      {snapshot.threads.length > 0 && (
        <button
          className={css.threadLauncher}
          type="button"
          onClick={() => openPanel()}
          aria-label={`打开 ${snapshot.threads.length} 个 Citation Threads`}
          title="Citation Threads"
        >
          <span aria-hidden="true">✦</span>
          <span>{snapshot.threads.length}</span>
        </button>
      )}
    </>
  )
}
