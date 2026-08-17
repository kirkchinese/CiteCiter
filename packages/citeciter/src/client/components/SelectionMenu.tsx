import { useEffect, useState } from 'react'
import type { CiteBus, CiteSelection } from '../types.ts'
import css from './CiteCiter.module.css'

const PREVIEW_LIMIT = 64

/** Dependencies injected into the root overlay entry. */
export interface SelectionMenuProps {
  readonly bus: CiteBus
  readonly openPanel: (selection: CiteSelection) => void
}

/**
 * Render the floating `Citer!` menu in the shell overlay.
 * @param props - shared selection bus and panel opener.
 * @returns menu element while a valid selection exists, otherwise null.
 */
export function SelectionMenu({ bus, openPanel }: SelectionMenuProps) {
  const [selection, setSelection] = useState<CiteSelection | null>(() => bus.getMenuSelection())

  useEffect(() => bus.subscribe(() => {
    setSelection(bus.getMenuSelection())
  }), [bus])

  if (selection === null) return null

  const preview = selection.text.length > PREVIEW_LIMIT
    ? `${selection.text.slice(0, PREVIEW_LIMIT)}…`
    : selection.text

  return (
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
  )
}
