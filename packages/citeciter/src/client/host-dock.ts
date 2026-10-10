/** Isolated, disposable layout adapter for the official DSH Web and Desktop frame. */
import { useEffect, useRef, useState, type RefObject } from 'react'
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
 * Measure the host's real content row instead of reconstructing its grid rows.
 * Official Desktop reserves Windows chrome with frame padding; newer hosts also
 * own a shell.bottom row. The right column keeps the row's height even at zero
 * width, so it excludes both without changing host layout or platform classes.
 */
function contentBounds(frame: HTMLElement, column: HTMLElement): { width: number, bottom: number, top: number } | null {
  const overlay = frame.querySelector<HTMLElement>(':scope > [data-shell-overlay]')
  if (overlay === null) return null
  const overlayRect = overlay.getBoundingClientRect()
  const rowRect = column.getBoundingClientRect()
  const root = frame.ownerDocument.documentElement
  const leading = root.dataset.platform === 'darwin' && !root.hasAttribute('data-fullscreen')
    ? Number.parseFloat(getComputedStyle(root).getPropertyValue('--dsh-frame-top-clearance')) || 0
    : 0
  return {
    width: overlayRect.width,
    bottom: Math.max(0, Math.min(overlayRect.height, rowRect.bottom - overlayRect.top)),
    top: Math.max(0, rowRect.top - overlayRect.top, leading),
  }
}

/**
 * Reserve host space without rewriting the host's saved columns or hiding details.
 * Unknown frame structures receive no DOM changes. All owned styles disappear on close.
 * @param panel - mounted panel reference.
 * @param open - whether space should be reserved.
 * @param percent - user's preferred fraction of the content viewport.
 * @param floating - whether the user detached the panel.
 * @param activation - increases only on explicit Citer navigation, permitting return from details.
 * @returns measured panel placement; null when the host frame is unsupported.
 */
export function useHostDock(panel: RefObject<HTMLElement | null>, open: boolean, percent: number, floating = false, activation = 0): DockGeometry | null {
  const [geometry, setGeometry] = useState<DockGeometry | null>(null)
  const navigation = useRef({ activation: -1, details: 0, preferDetails: true })
  const origin = useRef<HTMLElement | null>(null)
  useEffect(() => {
    if (!open) { setGeometry(null); return }
    // Floating panels portal to body; retain only the already-identified host.
    const frame = findContainingFrame(panel.current) ?? (origin.current?.isConnected === true ? origin.current : null)
    if (frame === null) { setGeometry(null); return }
    origin.current = frame
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
    let observedColumn: HTMLElement | null = null
    const resize = new ResizeObserver(() => apply())
    const apply = () => {
      if (frame.dataset.citeciterDockOwner !== undefined && frame.dataset.citeciterDockOwner !== owner) return
      const columns = frame.style.gridTemplateColumns
      // Both official release tracks expose the right column as a measured grid item.
      const tracks = /^(\d+(?:\.\d+)?)px\s+minmax\((?:0|\d+(?:\.\d+)?px),\s*1fr\)\s+(?:minmax\(0(?:px)?,\s*(\d+(?:\.\d+)?)px\)|(\d+(?:\.\d+)?)px)$/u.exec(columns)
      const column = frame.querySelector<HTMLElement>(':scope > [data-rightbar-col]')
      if (observedColumn !== column) {
        if (observedColumn !== null) resize.unobserve(observedColumn)
        if (column !== null) resize.observe(column)
        observedColumn = column
      }
      const bounds = column === null ? null : contentBounds(frame, column)
      if (tracks === null || bounds === null || frame.hasAttribute('data-rightbar-fullscreen') || getComputedStyle(frame).display !== 'grid') {
        clear()
        setGeometry(null)
        return
      }
      const details = Number(tracks[2] ?? tracks[3])
      const priority = navigation.current
      if (details !== priority.details) priority.preferDetails = true
      if (activation !== priority.activation) priority.preferDetails = false
      priority.activation = activation
      priority.details = details
      const next = resolveDockGeometry({
        width: bounds.width, height: bounds.bottom, sidebar: Number(tracks[1]), details, caption: bounds.top, percent, preferDetails: priority.preferDetails,
      })
      // Once both panes fit, subsequent shrinking gives native details priority again.
      if (next.mode === 'columns' || details === 0) priority.preferDetails = true
      if (next.mode === 'suspended' || floating && next.mode === 'columns') {
        clear()
        setGeometry(previous => previous?.mode === next.mode && previous.width === next.width
          && previous.height === next.height && previous.top === next.top ? previous : next)
        return
      }
      setTrack('--citeciter-host-columns', columns)
      setTrack('--citeciter-dock-width', next.width + 'px')
      frame.dataset.citeciterDockOwner = owner
      frame.dataset.citeciterLayout = next.mode
      setGeometry(previous => previous?.mode === next.mode && previous.width === next.width
        && previous.height === next.height && previous.top === next.top ? previous : next)
    }
    apply()
    const mutations = new MutationObserver(apply)
    resize.observe(frame)
    mutations.observe(frame, { attributes: true, attributeFilter: ['style', 'class', 'data-rightbar-fullscreen'], childList: true })
    mutations.observe(frame.ownerDocument.documentElement, { attributes: true, attributeFilter: ['style', 'data-platform', 'data-windows-titlebar', 'data-fullscreen'] })
    return () => {
      resize.disconnect()
      mutations.disconnect()
      clear()
    }
  }, [open, panel, percent, floating, activation])
  return geometry
}
