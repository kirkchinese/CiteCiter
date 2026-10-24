import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import { actionQuestion, type ActionModel, type CiteAction } from '../actions.ts'
import type { CiteSelection } from './types.ts'

/** Immutable capture from a conversation, imported document, native file preview or a Topic's own transcript. */
export type ActionSource = { readonly kind: 'conversation', readonly selection: CiteSelection, readonly quoteText?: string } | {
  /** An ordinary user message: excerpt only, not a host-verified citation claim. */
  readonly kind: 'quote'
  readonly sourceSessionId: SessionId
  readonly anchorKey: string
  readonly displayText: string
} | {
  readonly kind: 'document'
  readonly sourceSessionId: SessionId
  readonly displayText: string
  readonly prefixText: string
  readonly suffixText: string
  readonly title: string
  readonly documentId?: string
  readonly content?: string
} | {
  /** Text selected in a Topic's own answers or tool output; actions continue that Topic. */
  readonly kind: 'topic'
  readonly sourceSessionId: SessionId
  readonly topicSessionId: string
  readonly displayText: string
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
  pending: { readonly source: ActionSource, readonly action: CiteAction, readonly x: number, readonly y: number, readonly newTopic: boolean } | null
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

/**
 * Run a chosen action through the executor: the selected Topic by default, a new Topic on request.
 * Questions the user writes go to the composer; preset prompts follow the delivery setting.
 */
export function createActionController(execute: (source: ActionSource, action: CiteAction, question: string, model?: ActionModel, options?: { readonly newTopic?: boolean }) => Promise<void>, defaultModel: () => ActionModel | undefined = () => undefined) {
  const store = createSnapshotStore<ActionSnapshot>({ wheel: null, pending: null, submitting: false, error: null, model: undefined })
  let disposed = false
  let generation = 0
  const update = (fn: (draft: ActionSnapshot) => void) => { if (!disposed) store.update(fn) }
  const cancel = () => { generation++; update(d => { d.wheel = null; d.pending = null; d.error = null }) }
  const submit = async () => {
    const snapshot = store.getSnapshot()
    if (disposed || snapshot.submitting || snapshot.pending === null) return
    const { source, action, newTopic } = snapshot.pending
    const question = actionQuestion(action, '')
    const ticket = generation
    // A retry reads the model setting again, so repairing it in Settings takes effect.
    const model = defaultModel()
    update(d => { d.submitting = true; d.error = null; d.model = model })
    try {
      await execute(source, action, question, model, { newTopic })
      if (ticket === generation) update(d => { d.pending = null })
    } catch (error) {
      if (ticket === generation) update(d => { d.error = error instanceof Error ? error.message : String(error) })
    } finally { update(d => { d.submitting = false }) }
  }
  const choose = (index: number | null) => {
    const { wheel, submitting } = store.getSnapshot()
    if (disposed || submitting || wheel === null) return
    const action = index === null ? null : wheel.slots[index]
    if (action == null) { cancel(); return }
    update(d => { d.wheel = null; d.pending = { source: wheel.source, action, x: wheel.x, y: wheel.y, newTopic: false }; d.error = null })
    void submit()
  }
  /**
   * Run one action outside the wheel, such as from the selection toolbar.
   * @param source - captured selection; later selection changes do not affect it.
   * @param x - viewport x used to place a retry prompt if the action fails.
   * @param y - viewport y used to place a retry prompt if the action fails.
   */
  const run = (source: ActionSource, action: CiteAction, x: number, y: number, newTopic = false) => {
    const { submitting, pending } = store.getSnapshot()
    if (disposed || submitting || pending !== null) return
    generation++
    update(d => { d.wheel = null; d.model = defaultModel(); d.pending = { source, action, x, y, newTopic }; d.error = null })
    void submit()
  }
  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    open(source: ActionSource, x: number, y: number, slots: readonly (CiteAction | null)[], held: boolean) {
      if (disposed || store.getSnapshot().submitting || store.getSnapshot().pending !== null) return
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
    /** Focus loss cancels only the transient gesture; the Topic composer retains its draft. */
    dismissWheel() { update(d => { d.wheel = null }) },
    choose, run, cancel, submit,
    async dispose() { cancel(); disposed = true },
  }
}
export type ActionController = ReturnType<typeof createActionController>
