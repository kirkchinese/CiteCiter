import { useState } from 'react'
import type { SessionPendingInteraction } from '@deepseek-ai/dsh-client-ui-session/client'
import type {} from '@deepseek-ai/dsh-client-ui-approval/client'
import type {} from '@deepseek-ai/dsh-client-ui-user-questions/client'
import type { TopicMessage } from '../../topic.ts'
import { QuestionCard } from './QuestionCard.tsx'
import css from './NativeInteraction.module.css'

/** Present the Host's one-shot pending request. Decisions go to its existing waterfall; no second permission authority is created. Remount on pending.key. */
export function NativeInteraction({ pending, messages }: { readonly pending: SessionPendingInteraction, readonly messages: readonly TopicMessage[] }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  if (pending.kind === 'question' || pending.kind === 'plan-review') {
    return <div className={css.questions}><QuestionCard pending={pending} onAnswer={answer => pending.answer(answer)} onCancel={() => pending.cancel()} /></div>
  }
  if (pending.kind !== 'approval') return <p role="status">当前工具正在等待宿主交互。可停止后重试。</p>
  const call = messages.find(message => message.role === 'tool' && message.id === pending.callId)
  const answer = (decision: 'allowed-once' | 'rejected') => {
    if (busy) return
    setBusy(true)
    setError(undefined)
    void pending.answer(decision).catch(error => { setError(String(error)); setBusy(false) })
  }
  return <section className={css.approval} aria-label="DSH 工具审批">
    <div className={css.body}>
      <strong>等待授权 · {pending.toolName}</strong>
      {pending.reason !== undefined && <p>{pending.reason}</p>}
      {call?.role === 'tool' && <details><summary>查看工具参数</summary><pre>{call.arguments}</pre></details>}
      {error !== undefined && <p role="alert">{error}</p>}
    </div>
    <div className={css.actions}>
      <button type="button" disabled={busy} onClick={() => answer('rejected')}>拒绝</button>
      <button type="button" disabled={busy} onClick={() => answer('allowed-once')}>仅允许这次</button>
    </div>
  </section>
}
