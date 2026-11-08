import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { TeacherSuggestion } from '../topic.ts'
import { isChinese } from './i18n.ts'

/** Per-Session running facts from DSH's UI status; `running` is absent until DSH knows it. */
export type RunningStatus = ReadonlyMap<SessionId, { readonly running?: boolean | undefined }>

/**
 * Teacher mode's trigger: when the conversation on screen finishes a turn, ask the Host whether that turn holds
 * a point worth learning, and offer it. Only the conversation the user is looking at is watched.
 * @returns a disposer that stops watching.
 */
export function watchTeacherTurns(options: {
  readonly status: ObservableSnapshot<RunningStatus>
  readonly current: () => SessionId | null
  readonly enabled: () => boolean
  readonly check: (sessionId: SessionId) => Promise<TeacherSuggestion | null>
  readonly offer: (suggestion: TeacherSuggestion) => void
  readonly warn: (message: string, error: unknown) => void
}): () => void {
  const running = new Map<SessionId, boolean>()
  let disposed = false
  const update = () => {
    const current = options.current()
    const snapshot = options.status.getSnapshot()
    for (const [id, status] of snapshot) {
      const now = status.running
      if (now === undefined) continue
      const before = running.get(id)
      running.set(id, now)
      if (before !== true || now || id !== current || !options.enabled()) continue
      void options.check(id).then(suggestion => {
        // Offer it only while the user still looks at that conversation.
        if (!disposed && suggestion !== null && options.current() === id) options.offer(suggestion)
      }, (error: unknown) => options.warn('Citer teacher mode could not check a turn', error))
    }
  }
  update()
  const unsubscribe = options.status.subscribe(update)
  return () => { disposed = true; unsubscribe() }
}

/** The question an "Explain" sends to a new Topic: the point, and a request to teach it from the source turn. */
export function teacherQuestion(suggestion: TeacherSuggestion): string {
  return isChinese()
    ? `教师模式在主对话第 ${suggestion.turn} 轮发现了一个值得注意的知识点：「${suggestion.title}」——${suggestion.point}\n\n请先读取主对话中这一轮的相关内容，再结合它把这个知识点讲清楚，并用板书画图或推导。`
    : `Teacher mode found a point worth learning in turn ${suggestion.turn} of the main conversation: "${suggestion.title}" — ${suggestion.point}\n\nRead the relevant part of that turn first, then explain the point using it, with a blackboard diagram or derivation.`
}
