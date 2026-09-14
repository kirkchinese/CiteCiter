import { useEffect, useState } from 'react'
import type { SessionSnapshot } from '@deepseek-ai/dsh-api-session-controller/client'
import type { NativeComposer } from '../native-composer.ts'
import css from './NativeQueue.module.css'

/** Read and mutate the Host's authoritative inbox. Citer never owns a second queue. */
export function NativeQueue({ sessionId, native }: { readonly sessionId: string, readonly native: NativeComposer }) {
  const [snapshot, setSnapshot] = useState<SessionSnapshot>()
  const [error, setError] = useState<string>()
  useEffect(() => { setSnapshot(undefined); setError(undefined); return native.watch(sessionId, setSnapshot) }, [sessionId, native])
  const rows = snapshot?.queue.filter(row => row.placement !== 'context') ?? []
  const pending = snapshot?.pendingSubmissions ?? []
  const readError = snapshot?.openState === 'error' ? snapshot.lastAgentError : null
  if (rows.length === 0 && pending.length === 0 && error === undefined && readError === null) return null
  return <section className={css.queue} aria-label="DSH 发送队列">
    {error !== undefined && <p role="alert">{error}</p>}
    {readError !== null && <p role="alert">无法读取发送状态，正在重连：{readError}</p>}
    {pending.map(row => <div key={row.requestId} className={css.row}><span>发送中</span><p>{row.text || '附件'}</p></div>)}
    {rows.map(row => <div className={css.row} key={row.id}>
      <span title={row.placement === 'steering' ? '将在当前回答的下一步处理' : '当前回答完成后处理'}>{row.placement === 'steering' ? '插话' : '排队'}</span>
      <p title={row.text ?? row.preview}>{row.text ?? row.preview}</p>
      {row.placement === 'queued' && <button type="button" title="现在插话" aria-label="将此条排队消息改为插话" onClick={() => { void native.queue(sessionId, row.id, { kind: 'steer' }).catch(error => setError(String(error))) }}>↗</button>}
      <button type="button" title="移出队列" aria-label="移除此条待处理消息" onClick={() => { void native.queue(sessionId, row.id, { kind: 'remove' }).catch(error => setError(String(error))) }}>×</button>
    </div>)}
  </section>
}
