import { useEffect, useSyncExternalStore } from 'react'
import type { ConvViewProps } from '@deepseek-ai/dsh-client-ui-conversation/client'
import type { BoardElementState } from '../../board.ts'
import type { CompanionFace } from '../companion-controller.ts'
import type { CiteBus } from '../types.ts'
import { BoardView } from './BoardView.tsx'
import css from './BoardView.module.css'

/** Additional faces owned by CiteCiter's conversation-view registration. */
export interface BlackboardWorkspaceInjected {
  readonly companion: CompanionFace
  readonly bus: CiteBus
  readonly openPanel: () => void
}

export type BlackboardWorkspaceProps = ConvViewProps & BlackboardWorkspaceInjected

function citationPrompt(element: BoardElementState): string {
  const compact = element.content.replaceAll(/\s+/gu, ' ').trim()
  const label = ['text', 'markdown', 'math', 'table'].includes(element.kind) && compact !== ''
    ? compact.slice(0, 80)
    : `黑板元素 ${element.id}`
  return `关于黑板上的「${label}」：`
}

/**
 * Render the session-scoped blackboard registered through conversation.view.
 * @param props - active DSH conversation identity and CiteCiter browser faces.
 * @returns the matching Topic board or a source-specific empty state.
 */
export function BlackboardWorkspace({ sessionId, companion, bus, openPanel }: BlackboardWorkspaceProps) {
  const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot)

  useEffect(() => companion.retainVisible(), [companion])

  const active = snapshot.sourceSessionId === sessionId
    && snapshot.active?.topic.sourceSessionId === sessionId
    ? snapshot.active
    : null
  const quote = (element: BoardElementState) => {
    if (active === null) return
    bus.requestBoardCitation(active.topic.sessionId, citationPrompt(element))
    openPanel()
  }

  if (active === null) {
    return (
      <section className={css.workspaceEmpty} aria-label="CiteCiter 小黑板">
        <strong>小黑板</strong>
        <p>在 CiteCiter 右栏点击“+ 新 Topic → 讲解”，或打开已有讲解 Topic，板书会显示在这里。</p>
      </section>
    )
  }

  return (
    <BoardView
      snapshot={active.board}
      animations={snapshot.settings.boardAnimations ?? true}
      onQuoteElement={quote}
    />
  )
}
