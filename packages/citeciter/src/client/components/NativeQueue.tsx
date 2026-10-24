import { t, useLocale } from '../i18n.ts'
import { IconCloseOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useEffect, useState } from 'react'
import type { CiterSessionSnapshot } from '../citer-session-face.ts'
import type { MessageId } from '@deepseek-ai/dsh-llm/brand'
import type { NativeComposer } from '../native-composer.ts'
import css from './NativeQueue.module.css'

/** Read and mutate the Host's authoritative inbox. Citer never owns a second queue. */
export function NativeQueue({ sessionId, native }: { readonly sessionId: string, readonly native: NativeComposer }) {
  useLocale()
  const [snapshot, setSnapshot] = useState<CiterSessionSnapshot>()
  const [error, setError] = useState<string>()
  useEffect(() => { setSnapshot(undefined); setError(undefined); return native.watch(sessionId, setSnapshot) }, [sessionId, native])
  const rows = snapshot?.queue.filter(row => row.placement !== 'context') ?? []
  const pending = snapshot?.pendingSubmissions ?? []
  const readError = snapshot?.openState === 'error' ? snapshot.lastAgentError : null
  if (rows.length === 0 && pending.length === 0 && error === undefined && readError === null) return null
  return <section className={css.queue} aria-label={t('panel.queue.label')}>
    {error !== undefined && <p role="alert">{error}</p>}
    {readError !== null && <p role="alert">{t('panel.queue.readFailed', { error: readError })}</p>}
    {pending.map(row => <div key={row.requestId} className={css.row}><span>{t('panel.queue.sending')}</span><p>{row.text || t('panel.queue.attachment')}</p></div>)}
    {rows.map(row => <div className={css.row} key={row.id}>
      <span title={row.placement === 'steering' ? t('panel.queue.steerHint') : t('panel.queue.queuedHint')}>{row.placement === 'steering' ? t('panel.composer.steer') : t('panel.composer.queue')}</span>
      <p title={row.text || t('panel.queue.attachment')}>{row.text || t('panel.queue.attachment')}</p>
      {row.placement === 'queued' && <button type="button" title={t('panel.queue.steerNow')} aria-label={t('panel.queue.steerItem')} onClick={() => { void native.queue(sessionId, row.id as MessageId, { kind: 'steer' }).catch(error => setError(String(error))) }}>↗</button>}
      <button type="button" title={t('panel.queue.remove')} aria-label={t('panel.queue.removeItem')} onClick={() => { void native.queue(sessionId, row.id as MessageId, { kind: 'remove' }).catch(error => setError(String(error))) }}><IconCloseOutlineRegular /></button>
    </div>)}
  </section>
}
