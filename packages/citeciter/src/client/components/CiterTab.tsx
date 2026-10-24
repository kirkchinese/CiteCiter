import { useEffect } from 'react'
import type { UseSidebarRightTabInfo } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import { CitePanel, type CitePanelProps } from './CitePanel.tsx'
import mascotUrl from '../assets/citeciter-mascot.png'
import css from './CiterTab.module.css'

/**
 * Citer's workspace as a DSH right-sidebar tab. The sidebar owns placement, splitting, floating,
 * fullscreen and closing; while the tab is on screen Citer counts as open, so the desktop pet
 * steps aside and finished answers are not marked unread.
 */
export function CiterTab(props: CitePanelProps & { readonly useTabInfo: UseSidebarRightTabInfo }) {
  const { useTabInfo, bus, ...panel } = props
  const visible = useTabInfo().tab.visible
  useEffect(() => {
    if (!visible) return
    bus.setPanelOpen(true)
    return () => bus.setPanelOpen(false)
  }, [visible, bus])
  return <CitePanel {...panel} bus={bus} host="tab" tabVisible={visible} />
}

/** The mascot as the guide card and tab icon, at the size DSH draws icons. */
export function CiterIcon({ size = 16, className }: { readonly size?: number | undefined, readonly className?: string | undefined }) {
  return <img className={className === undefined ? css.icon : `${css.icon} ${className}`} src={mascotUrl} alt="" aria-hidden="true" width={size} height={size} draggable={false} />
}
