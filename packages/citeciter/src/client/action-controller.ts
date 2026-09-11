import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { actionQuestion, type ActionModel, type CiteAction } from '../actions.ts'
import type { CiteSelection } from './types.ts'

/** Immutable capture from a conversation, imported document or native file preview. */
export type ActionSource = { readonly kind: 'conversation', readonly selection: CiteSelection } | {
  readonly kind: 'document'
  readonly sourceSessionId: SessionId
  readonly displayText: string
  readonly prefixText: string
  readonly suffixText: string
  readonly title: string
  readonly documentId?: string
  readonly content?: string
}
export const actionSourceSession = (source: ActionSource): SessionId => source.kind === 'conversation' ? source.selection.sourceSessionId : source.sourceSessionId
export const actionSourceQuote = (source: ActionSource): string => source.kind === 'conversation' ? source.selection.displayText : source.displayText
export interface WheelSnapshot {
  readonly source: ActionSource
  readonly x: number
  readonly y: number
  readonly active: number | null
  readonly slots: readonly (CiteAction | null)[]
  readonly held: boolean
  readonly scale: number
}
export interface ActionSnapshot {
  wheel: WheelSnapshot | null
  pending: { readonly source: ActionSource, readonly action: CiteAction, readonly x: number, readonly y: number } | null
  question: string
  submitting: boolean
  error: string | null
  model: ActionModel | undefined
}

/** Direction around the actual displayed centre; no action inside the dead zone or outside the wheel. */
export function wheelSector(dx: number, dy: number): number | null {
  const radius = Math.hypot(dx, dy)
  if (radius < 42 || radius > 180) return null
  return Math.floor(((Math.atan2(dy, dx) + Math.PI / 2 + Math.PI * 2 + Math.PI / 8) % (Math.PI * 2)) / (Math.PI / 4))
}

/** Controller owns duplicate submission, retry drafts and source-change cancellation. Dispose with the Client. */
export function createActionController(execute: (source: ActionSource, action: CiteAction, question: string, model?: ActionModel) => Promise<void>, defaultModel: () => ActionModel | undefined = () => undefined) {
  const store = createSnapshotStore<ActionSnapshot>({ wheel: null, pending: null, question: '', submitting: false, error: null, model: undefined })
  let disposed = false
  let generation = 0
  const update = (fn: (draft: ActionSnapshot) => void) => { if (!disposed) store.update(fn) }
  const cancel = () => { generation++; update(d => { d.wheel = null; d.pending = null; d.error = null; d.question = '' }) }
  const submit = async () => {
    const snapshot = store.getSnapshot()
    if (disposed || snapshot.submitting || snapshot.pending === null) return
    const { source, action } = snapshot.pending
    if (action.ask && snapshot.question.trim() === '') return
    const question = actionQuestion(action, snapshot.question)
    if (question === '') return
    const ticket = generation
    update(d => { d.submitting = true; d.error = null })
    try {
      await execute(source, action, question, snapshot.model)
      if (ticket === generation) update(d => { d.pending = null; d.question = '' })
    } catch (error) {
      if (ticket === generation) update(d => { d.error = error instanceof Error ? error.message : String(error) })
    } finally { update(d => { d.submitting = false }) }
  }
  const choose = (index: number | null) => {
    const { wheel, submitting } = store.getSnapshot()
    if (disposed || submitting || wheel === null) return
    const action = index === null ? null : wheel.slots[index]
    if (action == null) { cancel(); return }
    update(d => { d.wheel = null; d.pending = { source: wheel.source, action, x: wheel.x, y: wheel.y }; d.question = ''; d.error = null })
    if (!action.ask) void submit()
  }
  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    open(source: ActionSource, x: number, y: number, slots: readonly (CiteAction | null)[], held: boolean) {
      if (disposed || store.getSnapshot().submitting) return
      generation++
      const scale = Math.min(1, (window.innerWidth - 16) / 360, (window.innerHeight - 16) / 400)
      const horizontal = 180 * scale + 8, above = 180 * scale + 8, below = 220 * scale + 8
      update(d => { d.pending = null; d.error = null; d.model = defaultModel(); d.wheel = { source, x: Math.max(horizontal, Math.min(x, window.innerWidth - horizontal)), y: Math.max(above, Math.min(y, window.innerHeight - below)), slots, active: null, held, scale } })
    },
    move(x: number, y: number) {
      const wheel = store.getSnapshot().wheel
      if (wheel === null) return
      const active = wheelSector((x - wheel.x) / wheel.scale, (y - wheel.y) / wheel.scale)
      if (active !== wheel.active) update(d => { d.wheel = { ...wheel, active } })
    },
    focus(index: number) { const wheel = store.getSnapshot().wheel; if (wheel !== null) update(d => { d.wheel = { ...wheel, active: index } }) },
    release(quick: boolean) {
      const wheel = store.getSnapshot().wheel
      if (wheel === null) return
      if (quick && wheel.active === null) update(d => { d.wheel = { ...wheel, held: false } })
      else choose(wheel.active)
    },
    choose, cancel, submit,
    setModel(model: ActionModel | undefined) { if (!store.getSnapshot().submitting) update(d => { d.model = model }) },
    setQuestion(question: string) { if (!store.getSnapshot().submitting) update(d => { d.question = question }) },
    async dispose() { cancel(); disposed = true },
  }
}
export type ActionController = ReturnType<typeof createActionController>
