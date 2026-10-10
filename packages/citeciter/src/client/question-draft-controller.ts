import { EMPTY_QUESTION_DRAFT_STATE, type QuestionDraftContent, type QuestionDraftState } from '../question-draft-contract.ts'
import { mergeQuestionDraft } from './draft-merge.ts'

export interface QuestionDraftResult {
  readonly state: QuestionDraftState
  readonly conflict?: boolean
  readonly closed?: boolean
}

/** The caller binds this port to one exact Topic/question key. It must never submit an answer. */
export interface QuestionDraftPort {
  get(): Promise<QuestionDraftResult>
  save(state: QuestionDraftState): Promise<QuestionDraftResult>
}

export interface QuestionDraftView {
  readonly content: QuestionDraftContent
  readonly ready: boolean
  readonly closed: boolean
  readonly error: string | null
}

/**
 * Keep question editing synchronous while serializing revision-checked background saves.
 * The owning question carrier outlives its React card. Disposal flushes but never submits,
 * and only an authoritative Host outcome may finish this draft before disposal.
 */
export function createQuestionDraftController(port: QuestionDraftPort, isOperating: () => boolean) {
  const listeners = new Set<() => void>()
  let state = EMPTY_QUESTION_DRAFT_STATE
  let base = state
  let remote: QuestionDraftState | undefined
  let composing = false
  let view: QuestionDraftView = { content: state.content, ready: false, closed: false, error: null }
  let generation = 0
  let saved = 0
  let epoch = 0
  let disposed = false
  let closing = false
  let loading: Promise<void> | undefined
  let saving: Promise<void> | undefined
  let disposal: Promise<void> | undefined
  let timer: ReturnType<typeof setTimeout> | undefined
  const current = (started: number) => !disposed && !view.closed && epoch === started
  const stopTimer = () => { clearTimeout(timer); timer = undefined }
  const emit = (patch: Partial<QuestionDraftView> = {}) => {
    if (disposed) return
    view = { ...view, ...patch, content: state.content }
    for (const listener of listeners) listener()
  }
  const fail = (error: unknown) => emit({ error: error instanceof Error ? error.message : String(error) })
  const finish = () => {
    if (disposed || view.closed) return
    stopTimer()
    epoch++
    saved = generation
    state = { ...state, content: EMPTY_QUESTION_DRAFT_STATE.content }
    emit({ ready: true, closed: true, error: null })
  }
  const ensure = (): Promise<void> => {
    if (disposed || view.closed || view.ready) return Promise.resolve()
    if (loading !== undefined) return loading
    const started = epoch
    loading = (async () => {
      const result = await port.get()
      if (!current(started)) return
      if (result.closed) { finish(); return }
      state = result.state
      base = result.state
      saved = generation
      emit({ ready: true, error: null })
    })().catch(error => { if (current(started)) fail(error); throw error }).finally(() => { loading = undefined })
    return loading
  }
  const flush = async (): Promise<void> => {
    await ensure()
    if (disposed || view.closed) return
    stopTimer()
    if (saving !== undefined) {
      await saving
      if (saved < generation) return flush()
      return
    }
    if (composing) return
    if (saved === generation) return
    const started = epoch
    saving = (async () => {
      let collisions = 0
      while (saved < generation && current(started)) {
        if (composing) return
        if (remote !== undefined) {
          state = { ...remote, content: mergeQuestionDraft(base.content, state.content, remote.content, isOperating()) }
          base = remote
          remote = undefined
          emit()
        }
        const savingGeneration = generation
        const result = await port.save(state)
        if (!current(started)) return
        if (result.closed) { finish(); return }
        if (result.conflict) {
          remote = result.state
          if (++collisions >= 4) {
            timer = setTimeout(() => { void flush().catch(() => { /* Real save failures remain visible. */ }) }, 250)
            return
          }
          continue
        }
        // A save acknowledgement advances the base revision, never the current input value.
        state = { ...state, revision: result.state.revision }
        base = result.state
        saved = savingGeneration
        if (view.error !== null) emit({ error: null })
      }
    })().catch(error => { if (current(started)) fail(error); throw error }).finally(() => { saving = undefined })
    return saving
  }
  const update = (change: (content: QuestionDraftContent) => QuestionDraftContent) => {
    if (disposed || closing || view.closed || !view.ready) return
    const content = change(state.content)
    if (content === state.content) return
    state = { ...state, content }
    generation++
    emit()
    stopTimer()
    timer = setTimeout(() => {
      void flush().catch(() => { /* The durable-draft view already reports this failure. */ })
    }, 150)
  }
  return {
    getSnapshot: (): QuestionDraftView => view,
    subscribe: (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } },
    ensure, flush,
    /** Bind manual submission to this window's saved version; the Host checks it atomically with acceptance. */
    prepareSubmission: async (): Promise<number> => {
      await flush()
      if (disposed || closing || view.closed) throw new Error('这个提问已结束，未提交回答')
      if (composing || saved < generation) throw new Error('回答尚未保存，未发送；请稍后重试')
      return state.revision
    },
    /** Preserve local answers when another window saved after our last edit or flush. */
    rejectSubmission: async (result: QuestionDraftResult): Promise<void> => {
      if (disposed || view.closed) return
      if (result.closed) { finish(); return }
      await saving
      if (disposed || view.closed) return
      if (result.state.revision < state.revision) return
      remote = result.state
      generation++
      await flush()
    },
    /** Keep remote reconciliation out of an unfinished input-method composition. */
    setComposing: (value: boolean) => {
      composing = value
      if (!value && saved < generation) {
        stopTimer()
        timer = setTimeout(() => { void flush().catch(() => { /* The view reports real persistence failures. */ }) }, 150)
      }
    },
    /** Echo edits before returning to React; persistence is deliberately deferred. */
    setAnswers: (answers: Readonly<Record<string, { readonly selected: readonly string[]; readonly custom: string }>>) => update(content => ({
      ...content, edited: true, answers: Object.fromEntries(Object.entries(answers).map(([id, answer]) => [id, { selected: [...answer.selected], custom: answer.custom }])),
    })),
    setPage: (page: number) => update(content => Number.isInteger(page) && page >= 0 && page !== content.page ? { ...content, page } : content),
    setWaitState: (next: { readonly edited?: boolean; readonly held?: boolean }) => update(content => {
      const edited = next.edited ?? content.edited
      const held = next.held ?? content.held
      return edited === content.edited && held === content.held ? content : { ...content, edited, held }
    }),
    hasUnsavedChanges: () => !view.closed && saved !== generation,
    /** Invalidate pending acknowledgements after the Host confirms acceptance or termination. */
    finish,
    /** Flush local edits without deleting the durable draft or submitting an answer. */
    dispose: (): Promise<void> => {
      if (disposal !== undefined) return disposal
      closing = true
      stopTimer()
      disposal = flush().finally(() => { disposed = true; epoch++; stopTimer(); listeners.clear() })
      return disposal
    },
  }
}

export type QuestionDraftController = ReturnType<typeof createQuestionDraftController>
