import { t, useLocale } from '../i18n.ts'
import { useState } from 'react'
import type { SessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-approval/client'
import type {} from '@deepseek-ai/dsh-client-ui-user-questions/client'
import type { PendingQuestion } from '@deepseek-ai/dsh-client-ui-user-questions/client'
import type { TopicMessage } from '../../topic.ts'
import { useNativeQuestionInteraction } from '../question-interaction.ts'
import { QuestionCard } from './QuestionCard.tsx'
import css from './NativeInteraction.module.css'

/** Bind native question state without giving React access to a Cordis service. */
function NativeQuestion({ pending }: { readonly pending: PendingQuestion }) {
  const { interaction, surface } = useNativeQuestionInteraction(pending)
  return <div className={css.questions}><QuestionCard pending={pending} interaction={interaction} surface={surface}
    onAnswer={answer => pending.answer(answer)} onCancel={() => pending.dismiss()} /></div>
}

/** Present the Host's one-shot pending request. Decisions go to its existing waterfall; no second permission authority is created. Remount on pending.key. */
export function NativeInteraction({ pending, messages }: { readonly pending: SessionPendingInteraction, readonly messages: readonly TopicMessage[] }) {
  useLocale()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  if (pending.kind === 'question' || pending.kind === 'plan-review') {
    return <NativeQuestion pending={pending} />
  }
  if (pending.kind !== 'approval') return <p role="status">{t('panel.approval.wait')}</p>
  const call = messages.find(message => message.role === 'tool' && message.id === pending.callId)
  const answer = (decision: 'allowed-once' | 'rejected') => {
    if (busy) return
    setBusy(true)
    setError(undefined)
    void pending.answer(decision).catch(error => { setError(String(error)); setBusy(false) })
  }
  return <section className={css.approval} aria-label={t('panel.approval.label')}>
    <div className={css.body}>
      <strong>{t('panel.approval.pending', { tool: pending.toolName })}</strong>
      {pending.reason !== undefined && <p>{pending.reason}</p>}
      {call?.role === 'tool' && <details><summary>{t('panel.approval.parameters')}</summary><pre>{call.arguments}</pre></details>}
      {error !== undefined && <p role="alert">{error}</p>}
    </div>
    <div className={css.actions}>
      <button type="button" disabled={busy} onClick={() => answer('rejected')}>{t('panel.approval.reject')}</button>
      <button type="button" disabled={busy} onClick={() => answer('allowed-once')}>{t('panel.approval.allowOnce')}</button>
    </div>
  </section>
}
