import { useEffect, useState } from 'react'
import type { CiteBus } from '../types.ts'
import css from './CiteCiter.module.css'

export interface CitePanelProps {
  readonly bus: CiteBus
  readonly close: () => void
}

/**
 * Right details-column panel. Milestone 0 renders the resolved selection;
 * the explainer session pipeline (fork, read-only permission switch, prompt,
 * rich-media rendering) attaches in the next milestone.
 */
export function CitePanel({ bus, close }: CitePanelProps) {
  const [selection, setSelection] = useState(() => bus.getPanelSelection())

  useEffect(() => bus.subscribe(() => {
    setSelection(bus.getPanelSelection())
  }), [bus])

  return (
    <div className={css.panel} data-citeciter-panel>
      <header className={css.panelHeader}>
        <span className={css.panelTitle}>CiteCiter</span>
        <button className={css.closeButton} type="button" aria-label="Close" onClick={close}>×</button>
      </header>
      {selection === null ? (
        <p className={css.panelHint}>选中助手回复中的一段文字，右键选择 Citer!。</p>
      ) : (
        <div className={css.panelBody}>
          <blockquote className={css.quote}>{selection.text}</blockquote>
          <dl className={css.meta}>
            <dt>kind</dt>
            <dd>{selection.kind}</dd>
            <dt>anchor</dt>
            <dd>{selection.anchorKey}</dd>
          </dl>
          <p className={css.panelNote}>解释会话接入（fork + 只读权限 + 富媒体渲染）将在下一里程碑完成。</p>
        </div>
      )}
    </div>
  )
}
