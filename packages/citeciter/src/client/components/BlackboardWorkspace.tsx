import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions, OverlayActions } from '../view-actions.ts'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { BoardElementState } from '../../board.ts'
import { boardCitationPrompt } from '../board-citation.ts'
import { t, useLocale } from '../i18n.ts'
import { BoardView } from './BoardView.tsx'
import css from './BoardView.module.css'

/** Additional faces owned by CiteCiter's conversation-view registration. */
export interface BlackboardWorkspaceInjected {
  readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>
  readonly companion: CompanionActions
  readonly bus: OverlayActions
  readonly openPanel: () => void
}

export type BlackboardWorkspaceProps = ConvViewProps & BlackboardWorkspaceInjected

/**
 * Render the session-scoped blackboard registered through conversation.view.
 * @param props - active DSH conversation identity and CiteCiter browser faces.
 * @returns the matching Topic board or a source-specific empty state.
 */
export function BlackboardWorkspace({ useCompanion, sessionId, companion, bus, openPanel }: BlackboardWorkspaceProps) {
  useLocale()
  const snapshot = useCompanion(value => value)
  const workspaceRef = useRef<HTMLDivElement | null>(null)
  const [compact, setCompact] = useState(false)
  useLayoutEffect(() => {
    const workspace = workspaceRef.current
    if (workspace === null) return
    const update = () => setCompact(workspace.clientWidth < 720)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(workspace)
    return () => observer.disconnect()
  }, [])

  useEffect(() => companion.retainVisible(), [companion])

  const active = snapshot.sourceSessionId === sessionId
    && snapshot.active?.topic.sourceSessionId === sessionId
    ? snapshot.active
    : null
  const quote = (element: BoardElementState) => {
    if (active === null) return
    bus.requestBoardCitation(active.topic.sessionId, boardCitationPrompt(element))
    openPanel()
  }

  if (active === null) {
    return (
      <div ref={workspaceRef} className={css.workspaceBoard}>
        <section className={css.workspaceEmpty} aria-label={t('board.workspace.label')}>
          <strong>{t('board.title')}</strong>
          <p>{t('board.workspace.empty')}</p>
        </section>
      </div>
    )
  }

  return (
    <div ref={workspaceRef} className={css.workspaceBoard}>
      <BoardView
        sessionId={active.topic.sessionId}
        snapshot={active.board}
        animations={snapshot.settings.boardAnimations ?? true}
        compact={compact}
        onQuoteElement={quote}
      />
    </div>
  )
}
