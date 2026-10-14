import { useEffect, useRef, useState } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { CiteOverlaySnapshot } from '../types.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions } from '../view-actions.ts'
import { CiterPet } from './CiterPet.tsx'

/**
 * Entry back to Citer while its panel is closed. While an answer is still running it keeps
 * the Topic refreshing, so the pet can mark the finished answer; opening Citer clears the mark.
 */
export function CiteLauncher({ useCompanion, useOverlay, companion, openPanel }: {
  useCompanion: SnapshotSelectorHook<CompanionSnapshot>, useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>, companion: CompanionActions, openPanel: () => void
}) {
  const sourceSessionId = useCompanion(value => value.sourceSessionId)
  const running = useCompanion(value => value.active?.topic.running === true)
  const waiting = useCompanion(value => (value.active?.pendingQuestions?.length ?? (value.active?.pendingQuestion == null ? 0 : 1)) > 0)
  const open = useOverlay(value => value.panelOpen)
  const [finished, setFinished] = useState(false)
  const wasRunning = useRef(running)
  useEffect(() => !open && running ? companion.retainVisible() : undefined, [companion, open, running])
  useEffect(() => {
    if (wasRunning.current && !running && !open) setFinished(true)
    wasRunning.current = running
  }, [running, open])
  useEffect(() => { if (open) setFinished(false) }, [open])
  if (sourceSessionId === null || open) return null
  return <CiterPet attention={finished || waiting} onOpen={openPanel} />
}
