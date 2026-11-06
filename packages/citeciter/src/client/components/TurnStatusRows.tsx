import { useEffect, useMemo, useState } from 'react'
import { StateDot, TextShimmer } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TopicMessage } from '../../topic.ts'
import { t, useLocale } from '../i18n.ts'
import css from './TurnStatusRows.module.css'

/** Whole seconds shown for a retry delay, never below one, as DSH counts them. */
function retrySeconds(milliseconds: number): number {
  return Math.max(1, Math.ceil(milliseconds / 1000))
}

/** DSH's wording for failures whose raw message is not meant for people. */
function failureText(message: string, code: string | undefined, friendly: (text: string) => string): string {
  if (code === 'AUTH') return t('transcript.failure.auth')
  if (code === 'QUOTA' || code === 'ACCOUNT_QUOTA') return t('transcript.failure.quota')
  if (code === 'INTERRUPTED') return t('transcript.failure.interrupted')
  return friendly(message)
}

/**
 * One model-request retry chain, as DSH's transcript shows it: the attempt and its limit, a countdown
 * while it waits, and the delay and failure reason when expanded.
 */
export function RetryRow({ message, friendly }: { readonly message: Extract<TopicMessage, { role: 'retry' }>, readonly friendly: (text: string) => string }) {
  useLocale()
  const active = message.state === 'scheduled'
  const deadline = useMemo(() => Date.now() + message.delayMs, [message.delayMs, message.seq])
  const [remaining, setRemaining] = useState(() => retrySeconds(deadline - Date.now()))
  useEffect(() => {
    if (!active) return
    const update = () => {
      const next = retrySeconds(deadline - Date.now())
      setRemaining(next)
      return next
    }
    if (update() === 1) return
    const timer = window.setInterval(() => { if (update() === 1) window.clearInterval(timer) }, 250)
    return () => window.clearInterval(timer)
  }, [active, deadline])
  const label = active ? t('transcript.retry.active') : message.state === 'cancelled' ? t('transcript.retry.cancelled') : t('transcript.retry.started')
  const status = t('transcript.retry.status', {
    label, retry: message.retry, maximum: message.maxRetries ?? '∞', seconds: active ? remaining : retrySeconds(message.delayMs),
  })
  return <details className={css.retryRow} data-active={active || undefined} data-citeciter-message={message.id}>
    <summary className={css.retrySummary}>
      <span className={css.retryText} role="status"><TextShimmer active={active}>{status}</TextShimmer></span>
    </summary>
    <div className={css.retryDetails}>
      <div><span className={css.retryDetailLabel}>{t('transcript.retry.delay')}</span>{t('transcript.retry.milliseconds', { milliseconds: Math.round(message.delayMs) })}</div>
      <div><span className={css.retryDetailLabel}>{t('transcript.retry.failure')}</span>{failureText(message.failure, message.code, friendly)}</div>
    </div>
  </details>
}

/** A turn that failed or was stopped, as DSH's terminal turn row: a state dot, the outcome and its code. */
export function TurnErrorRow({ message, friendly }: { readonly message: Extract<TopicMessage, { role: 'error' }>, readonly friendly: (text: string) => string }) {
  useLocale()
  const stopped = message.status === 'stopped'
  const detail = stopped ? undefined : failureText(message.text, message.code, friendly)
  return <div className={css.turnErrorRow} data-citeciter-message={message.id} data-status={message.status} role={stopped ? 'status' : 'alert'}>
    <StateDot state={stopped ? 'idle' : 'error'} className={css.turnErrorDot} />
    <div className={css.turnErrorCopy}>
      <span className={stopped ? css.turnStoppedTitle : css.turnErrorTitle}>{stopped ? t('panel.phase.stopped') : t('transcript.turnError')}</span>
      {detail !== undefined && <span className={css.turnErrorMessage}>{detail}</span>}
      {message.bodyRetained && <span className={css.turnErrorNote}>{t('panel.error.retained')}</span>}
      {detail !== undefined && detail !== message.text && <details className={css.turnErrorDetails}><summary>{t('panel.error.details')}</summary><pre>{message.text}</pre></details>}
    </div>
    {message.code !== undefined && message.code !== 'INTERRUPTED' && <code className={css.turnErrorCode}>{message.code}</code>}
  </div>
}
