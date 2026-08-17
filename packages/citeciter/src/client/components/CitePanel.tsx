import { useCallback, useSyncExternalStore } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CiteBus } from '../types.ts'
import type { ExplainFace, ExplainPhase } from '../explainer.ts'
import css from './CiteCiter.module.css'

export interface CitePanelProps {
  readonly bus: CiteBus
  readonly close: () => void
  readonly explainer: ExplainFace
}

const PHASE_LABEL: Record<ExplainPhase, string> = {
  idle: '空闲',
  creating: '正在创建解释会话…',
  ready: '解释会话已就绪',
  running: '正在解释…',
  settled: '解释完成',
  error: '解释失败',
}

/** Right details-column panel with the explainer pipeline status. */
export function CitePanel({ bus, close, explainer }: CitePanelProps) {
  const subscribeBus = useCallback((onStoreChange: () => void) => bus.subscribe(onStoreChange), [bus])
  const subscribeExplainer = useCallback((onStoreChange: () => void) => explainer.subscribe(onStoreChange), [explainer])
  const selection = useSyncExternalStore(subscribeBus, () => bus.getPanelSelection())
  const snapshot = useSyncExternalStore(subscribeExplainer, () => explainer.getSnapshot())

  return (
    <div className={css.panel} data-citeciter-panel>
      <header className={css.panelHeader}>
        <span className={css.panelTitle}>CiteCiter</span>
        <button className={css.closeButton} type="button" aria-label="Close" onClick={close}>×</button>
      </header>
      {selection === null && snapshot.selection === null ? (
        <p className={css.panelHint}>选中助手回复中的一段文字，右键选择 Citer!。</p>
      ) : (
        <div className={css.panelBody}>
          <blockquote className={css.quote}>{(selection ?? snapshot.selection)?.text}</blockquote>
          <dl className={css.meta}>
            <dt>anchor</dt>
            <dd>{(selection ?? snapshot.selection)?.anchorKey}</dd>
            <dt>child</dt>
            <dd>{snapshot.childId ?? '—'}</dd>
            <dt>status</dt>
            <dd>{PHASE_LABEL[snapshot.phase]}</dd>
          </dl>
          {snapshot.permissionWarning !== null && (
            <p className={css.panelWarn}>{snapshot.permissionWarning}</p>
          )}
          {snapshot.error !== null && (
            <p className={css.panelError} data-citeciter-error>{snapshot.error}</p>
          )}
          {snapshot.answerText !== null && snapshot.answerText !== '' && (
            <div className={css.panelAnswer} data-citeciter-answer>
              <MarkdownText text={snapshot.answerText} />
            </div>
          )}
          <div className={css.panelActions}>
            {snapshot.phase === 'running' && (
              <button
                className={css.actionButton}
                type="button"
                onClick={() => { void explainer.stop() }}
              >
                停止
              </button>
            )}
            <span className={css.panelNote}>解释会话独立运行，不写入主会话。</span>
          </div>
        </div>
      )}
    </div>
  )
}
