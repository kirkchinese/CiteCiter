import { useEffect, useRef, useState } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { CiteOverlaySnapshot } from '../types.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions, TeacherActions } from '../view-actions.ts'
import { t, useLocale } from '../i18n.ts'
import { CiterPet, PetSpot } from './CiterPet.tsx'
import { TeacherNotice } from './TeacherNotice.tsx'
import css from './TeacherNotice.module.css'

/** How long the "pet hidden" hint stays after hiding her. */
const HIDDEN_HINT_MS = 6000

/**
 * Entry back to Citer while its panel is closed. While an answer is still running it keeps
 * the Topic refreshing, so the pet can mark the finished answer; opening Citer clears the mark.
 * Teacher mode's offer speaks from the pet, or from her place when the user hid her.
 */
export function CiteLauncher({ useCompanion, useOverlay, companion, openPanel, teacher }: {
  useCompanion: SnapshotSelectorHook<CompanionSnapshot>, useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>, companion: CompanionActions, openPanel: () => void, teacher: TeacherActions
}) {
  useLocale()
  const sourceSessionId = useCompanion(value => value.sourceSessionId)
  const running = useCompanion(value => value.active?.topic.running === true)
  const waiting = useCompanion(value => (value.active?.pendingQuestions?.length ?? (value.active?.pendingQuestion == null ? 0 : 1)) > 0)
  const showPet = useCompanion(value => value.settings.showPet ?? true)
  const open = useOverlay(value => value.panelOpen)
  const suggestion = useOverlay(value => value.teacher)
  const [finished, setFinished] = useState(false)
  const [hiddenHint, setHiddenHint] = useState(false)
  const wasRunning = useRef(running)
  useEffect(() => !open && running ? companion.retainVisible() : undefined, [companion, open, running])
  useEffect(() => {
    if (wasRunning.current && !running && !open) setFinished(true)
    wasRunning.current = running
  }, [running, open])
  useEffect(() => { if (open) setFinished(false) }, [open])
  useEffect(() => {
    if (!hiddenHint) return
    const timer = setTimeout(() => setHiddenHint(false), HIDDEN_HINT_MS)
    return () => clearTimeout(timer)
  }, [hiddenHint])
  if (sourceSessionId === null || open) return null
  const notice = suggestion === null ? undefined : <TeacherNotice suggestion={suggestion} actions={teacher} variant="bubble" />
  if (!showPet) {
    if (notice !== undefined) return <PetSpot>{notice}</PetSpot>
    return hiddenHint ? <PetSpot><p className={css.notice} data-variant="bubble" role="status">{t('panel.pet.hidden')}</p></PetSpot> : null
  }
  return <CiterPet attention={finished || waiting || suggestion !== null} onOpen={openPanel}
    onHide={() => { setHiddenHint(true); void companion.setSetting('showPet', false) }}
    {...(notice === undefined ? {} : { bubble: notice })} />
}
