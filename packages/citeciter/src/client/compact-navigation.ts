import { useEffect, type RefObject } from 'react'
import { findContainingFrame } from './host-dock.ts'

/** Suspend only covered host panes while Citer occupies the compact content page; restore their focusability on return. */
export function useCompactNavigation(panel: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return
    const frame = findContainingFrame(panel.current)
    if (frame === null) return
    const owned = new Map<HTMLElement, { inert: boolean, hidden: string | null }>()
    const cover = () => {
      const bounds = panel.current?.getBoundingClientRect()
      if (bounds === undefined) return
      for (const element of frame.children) {
        if (!(element instanceof HTMLElement) || element.hasAttribute('data-shell-overlay') || owned.has(element)) continue
        const rect = element.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0 || rect.right <= bounds.left + 1 || rect.bottom <= bounds.top + 1) continue
        if (element.classList.contains('dshDesktopWindowsCaptionRow') || element.classList.contains('dshDesktopMacCaptionRow')) continue
        owned.set(element, { inert: element.inert, hidden: element.getAttribute('aria-hidden') })
        element.inert = true
        element.setAttribute('aria-hidden', 'true')
        element.setAttribute('data-citeciter-covered', '')
      }
    }
    cover()
    const observer = new MutationObserver(cover)
    observer.observe(frame, { childList: true })
    return () => {
      observer.disconnect()
      for (const [element, previous] of owned) {
        element.inert = previous.inert
        if (previous.hidden === null) element.removeAttribute('aria-hidden')
        else element.setAttribute('aria-hidden', previous.hidden)
        element.removeAttribute('data-citeciter-covered')
      }
    }
  }, [panel, active])
}
