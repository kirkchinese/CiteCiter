import { useEffect } from 'react'
import type { UseSidebarRightTabInfo } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { CitePanel, type CitePanelProps } from './CitePanel.tsx'
import mascotUrl from '../assets/citeciter-mascot.png'
import css from './CiterTab.module.css'

/**
 * Citer's workspace as a DSH right-sidebar tab. The sidebar owns placement, splitting, floating,
 * fullscreen and closing; while the tab is on screen Citer counts as open, so the desktop pet
 * steps aside and finished answers are not marked unread. When the user chose Citer's own panel,
 * a Citer tab (opened from the guide, or left from before) closes and opens that panel instead.
 */
export function CiterTab(props: CitePanelProps & { readonly useTabInfo: UseSidebarRightTabInfo }) {
  const { useTabInfo, bus, ...panel } = props
  const { visible, actions } = useTabInfo().tab
  const standalone = panel.useOverlay(value => value.host === 'overlay')
  // Split panes and floating copies can show several Citer tabs; Citer is open while any is visible.
  useEffect(() => visible && !standalone ? bus.holdTabVisible() : undefined, [visible, standalone, bus])
  useEffect(() => {
    if (!standalone) return
    actions.close()
    bus.setPanelOpen(true)
  }, [standalone, actions, bus])
  if (standalone) return null
  return <CitePanel {...panel} bus={bus} host="tab" tabVisible={visible} />
}

/** The mascot as the guide card and tab icon, at the size DSH draws icons. */
export function CiterIcon({ size = 16, className }: { readonly size?: number | undefined, readonly className?: string | undefined }) {
  return <img className={className === undefined ? css.icon : `${css.icon} ${className}`} src={mascotUrl} alt="" aria-hidden="true" width={size} height={size} draggable={false} />
}
