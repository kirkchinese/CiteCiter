import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { CiteOverlaySnapshot } from '../types.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import mascotUrl from '../assets/citeciter-mascot.png'
import css from './CiteCiter.module.css'

/** Independent entry back to the current learning workspace; owns no selection state. */
export function CiteLauncher({ useCompanion, useOverlay, openPanel }: {
  useCompanion: SnapshotSelectorHook<CompanionSnapshot>, useOverlay: SnapshotSelectorHook<CiteOverlaySnapshot>, openPanel: () => void
}) {
  const snapshot = useCompanion(value => value)
  const open = useOverlay(value => value.panelOpen)
  if (snapshot.sourceSessionId === null || open) return null
  return <button className={css.topicLauncher} type="button" onClick={openPanel} aria-label={snapshot.topics.length === 0 ? '打开 CiteCiter' : `打开 CiteCiter，共 ${snapshot.topics.length} 个讨论`} title="打开 CiteCiter"><img src={mascotUrl} alt="" aria-hidden="true" />{snapshot.topics.length > 0 && <span className={css.launcherCount}>{snapshot.topics.length}</span>}</button>
}
