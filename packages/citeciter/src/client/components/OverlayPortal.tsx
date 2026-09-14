import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

/**
 * Render plugin-owned floating content outside the shell's stacking context.
 * The public slot still owns its React lifetime; unmounting removes the portal.
 * Inline content keeps its original ancestry for the isolated dock adapter.
 */
export function OverlayPortal({ children, inline = false }: { readonly children: ReactNode, readonly inline?: boolean }) {
  return inline ? children : createPortal(children, document.body)
}
