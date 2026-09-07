/** Isolated, disposable layout adapter for DSH rc.1 and Desktop 2.0.5 frames. */
import { useEffect, useState, type RefObject } from 'react'
import { resolveDockGeometry, type DockGeometry } from './dock-geometry.ts'

/**
 * Locate the frame owning the public shell.overlay contribution.
 * @param panel - mounted learning panel.
 * @returns its immediate frame, or null before mounting.
 */
export function findContainingFrame(panel: HTMLElement | null): HTMLElement | null {
  return panel?.closest<HTMLElement>('[data-shell-overlay]')?.parentElement ?? null
}

/**
 * Reserve host space without rewriting the host's saved columns or hiding details.
 * Unknown frame structures receive no DOM changes. All owned styles disappear on close.
 * @param panel - mounted panel reference.
 * @param open - whether space should be reserved.
 * @param percent - user's preferred fraction of the content viewport.
 * @returns measured panel placement; null when the host frame is unsupported.
 */
export function useHostDock(panel: RefObject<HTMLElement | null>, open: boolean, percent: number): DockGeometry | null {
  const [geometry, setGeometry] = useState<DockGeometry | null>(null)
  useEffect(() => {
    if (!open) return
    const frame = findContainingFrame(panel.current)
    if (frame === null) return
    const owner = crypto.randomUUID()
    const saved = new Map<string, { value: string, priority: string }>()
    const setTrack = (name: string, value: string) => {
      if (!saved.has(name)) saved.set(name, {
        value: frame.style.getPropertyValue(name), priority: frame.style.getPropertyPriority(name),
      })
      if (frame.style.getPropertyValue(name) !== value) frame.style.setProperty(name, value)
    }
    const clear = () => {
      if (frame.dataset.citeciterDockOwner !== owner) return
      delete frame.dataset.citeciterDockOwner
      delete frame.dataset.citeciterLayout
      for (const [name, prior] of saved) {
        if (prior.value === '') frame.style.removeProperty(name)
        else frame.style.setProperty(name, prior.value, prior.priority)
      }
      saved.clear()
    }
    const apply = () => {
      if (frame.dataset.citeciterDockOwner !== undefined && frame.dataset.citeciterDockOwner !== owner) return
      const columns = frame.style.gridTemplateColumns
      const tracks = /^(\d+(?:\.\d+)?)px\s+minmax\(0(?:px)?,\s*1fr\)\s+(\d+(?:\.\d+)?)px$/u.exec(columns)
      if (tracks === null || getComputedStyle(frame).display !== 'grid') {
        clear()
        setGeometry(null)
        return
      }
      const rect = frame.getBoundingClientRect()
      const caption = frame.querySelector<HTMLElement>(':scope > .dshDesktopWindowsCaptionRow, :scope > .dshDesktopMacCaptionRow')
        ?.getBoundingClientRect().height ?? 0
      const next = resolveDockGeometry({
        width: rect.width, height: rect.height, sidebar: Number(tracks[1]), details: Number(tracks[2]), caption, percent,
      })
      setTrack('--citeciter-host-columns', columns)
      setTrack('--citeciter-dock-width', next.width + 'px')
      setTrack('--citeciter-dock-height', next.height + 'px')
      setTrack('--citeciter-host-rows', caption > 0 ? `${caption}px minmax(0, 1fr)` : 'minmax(0, 1fr)')
      setTrack('--citeciter-sidebar-row-end', caption > 0 ? '3' : '2')
      frame.dataset.citeciterDockOwner = owner
      frame.dataset.citeciterLayout = next.mode
      setGeometry(previous => previous?.mode === next.mode && previous.width === next.width
        && previous.height === next.height && previous.top === next.top ? previous : next)
    }
    apply()
    const resize = new ResizeObserver(apply)
    const mutations = new MutationObserver(apply)
    resize.observe(frame)
    mutations.observe(frame, { attributes: true, attributeFilter: ['style', 'class'], childList: true })
    return () => {
      resize.disconnect()
      mutations.disconnect()
      clear()
    }
  }, [open, panel, percent])
  return geometry
}
