import { useEffect, type RefObject } from 'react'
import { findContainingFrame } from './host-dock.ts'

/** Suspend only covered host panes while Citer occupies the compact content page; restore their focusability on return. */
export function useCompactNavigation(panel: RefObject<HTMLElement | null>, active: boolean): void {
  useEffect(() => {
    if (!active) return
    const frame = findContainingFrame(panel.current)
    if (frame === null) return
    const owned = new Map<HTMLElement, { inert: boolean, hidden: string | null }>()
    const restore = (element: HTMLElement) => {
      const previous = owned.get(element)
      if (previous === undefined) return
      element.inert = previous.inert
      if (previous.hidden === null) element.removeAttribute('aria-hidden')
      else element.setAttribute('aria-hidden', previous.hidden)
      element.removeAttribute('data-citeciter-covered')
      owned.delete(element)
    }
    const cover = () => {
      const bounds = panel.current?.getBoundingClientRect()
      if (bounds === undefined) return
      const covered = new Set<HTMLElement>()
      for (const element of frame.children) {
        if (!(element instanceof HTMLElement) || element.matches('[data-shell-overlay], [data-shell-bottom], [data-shell-leading]')) continue
        const rect = element.getBoundingClientRect()
        if (rect.width <= 0 || rect.height <= 0 || rect.right <= bounds.left + 1 || rect.bottom <= bounds.top + 1
          || rect.left >= bounds.right - 1 || rect.top >= bounds.bottom - 1) continue
        covered.add(element)
        if (owned.has(element)) continue
        owned.set(element, { inert: element.inert, hidden: element.getAttribute('aria-hidden') })
        element.inert = true
        element.setAttribute('aria-hidden', 'true')
        element.setAttribute('data-citeciter-covered', '')
      }
      for (const element of owned.keys()) if (!covered.has(element)) restore(element)
    }
    cover()
    const observer = new MutationObserver(cover)
    observer.observe(frame, { childList: true })
    const resize = new ResizeObserver(cover)
    resize.observe(frame)
    if (panel.current !== null) resize.observe(panel.current)
    return () => {
      observer.disconnect()
      resize.disconnect()
      for (const element of owned.keys()) restore(element)
    }
  }, [panel, active])
}
