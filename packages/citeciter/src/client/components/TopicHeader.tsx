import type { PointerEventHandler, ReactNode } from 'react'
import { CompactBackButton } from './CompactBackButton.tsx'
import mascotUrl from '../assets/citeciter-mascot.png'
import css from './TopicHeader.module.css'

/**
 * Layout-only header. The Citer mark identifies the panel; dragging the header floats it.
 * Navigation, title and closing are supplied by their own controllers.
 * @param status - shown only while something is happening or needs attention.
 */
export function TopicHeader({ compact, onBack, onClose, onDrag, title, status, children }: {
  readonly compact: boolean
  readonly onBack: () => void
  readonly onClose: () => void
  readonly onDrag: PointerEventHandler<HTMLElement>
  readonly title: ReactNode
  readonly status: string | null
  readonly children: ReactNode
}) {
  return <header className={css.header} data-compact={compact || undefined} onPointerDown={compact ? undefined : onDrag}>
    {compact ? <CompactBackButton onBack={onBack} /> : <img className={css.mark} src={mascotUrl} alt="" aria-hidden="true" draggable={false} />}
    <div className={css.heading}>{title}{status !== null && <span className={css.status} role="status">{status}</span>}</div>
    {children}
    {!compact && <button type="button" className={css.close} onClick={onClose} aria-label="收起 Citer" title="收起">
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>
    </button>}
  </header>
}
