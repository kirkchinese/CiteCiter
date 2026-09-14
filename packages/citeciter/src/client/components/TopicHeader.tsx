import type { PointerEventHandler, ReactNode } from 'react'
import { CompactBackButton } from './CompactBackButton.tsx'
import css from './TopicHeader.module.css'

/** Layout-only header: navigation, title and drag behavior are supplied by their independent controllers. */
export function TopicHeader({ compact, onBack, onDrag, title, status, children }: {
  readonly compact: boolean
  readonly onBack: () => void
  readonly onDrag: PointerEventHandler<HTMLElement>
  readonly title: ReactNode
  readonly status: string
  readonly children: ReactNode
}) {
  return <header className={css.header} data-compact={compact || undefined} onPointerDown={compact ? undefined : onDrag}>
    {compact ? <CompactBackButton onBack={onBack} /> : <span className={css.grip} aria-hidden="true">⠿</span>}
    <div className={css.heading}>{title}<span className={css.status}>{status}</span></div>
    {children}
  </header>
}
