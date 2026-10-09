import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions, OverlayActions } from '../view-actions.ts'
import { useEffect } from 'react'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { BoardElementState } from '../../board.ts'
import { boardCitationPrompt } from '../board-citation.ts'
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
  const snapshot = useCompanion(value => value)

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
      <section className={css.workspaceEmpty} aria-label="CiteCiter 小黑板">
        <strong>小黑板</strong>
        <p>在 Citer 中发送绘图或教学问题，板书会显示在这里。</p>
      </section>
    )
  }

  return (
    <BoardView
      sessionId={active.topic.sessionId}
      snapshot={active.board}
      animations={snapshot.settings.boardAnimations ?? true}
      onQuoteElement={quote}
    />
  )
}
