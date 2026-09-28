import { createSnapshotStore } from '@deepseek-ai/dsh-client-store'
import type { BoardCaptureJob } from '../board-capture-protocol.ts'
import type { CiteCiterRequest, CiteCiterResponse } from '../topic.ts'

export interface BoardCaptureSnapshot { jobs: readonly BoardCaptureJob[] }

/**
 * Poll only model-requested board renders, independently of navigation or visible Topics.
 * @param request - authenticated root-scoped Citer transport; no Session activation is needed.
 * @param report - report transport failures once until connectivity recovers.
 * @returns render store and stable reply callback; dispose aborts RPCs and removes the poll timer.
 */
export function createBoardCaptureController(
  request: (request: CiteCiterRequest, signal: AbortSignal) => Promise<CiteCiterResponse>,
  report: (error: unknown) => void,
) {
  const store = createSnapshotStore<BoardCaptureSnapshot>({ jobs: [] })
  const abort = new AbortController()
  const completed = new Set<string>()
  let timer: ReturnType<typeof setTimeout> | undefined
  let reported = false
  const poll = async () => {
    try {
      const response = await request({ action: 'board-capture-pending' }, abort.signal)
      if (abort.signal.aborted) return
      if (response.kind !== 'board-captures') throw new Error('Unexpected board capture response')
      reported = false
      const live = new Set(response.jobs.map(job => job.id))
      for (const id of completed) if (!live.has(id)) completed.delete(id)
      const jobs = response.jobs.filter(job => !completed.has(job.id))
      if (jobs.map(job => job.id).join() !== store.getSnapshot().jobs.map(job => job.id).join()) store.update(draft => { draft.jobs = jobs })
    } catch (error) {
      if (!abort.signal.aborted && !reported) { reported = true; report(error) }
    } finally {
      if (!abort.signal.aborted) timer = setTimeout(() => { void poll() }, 750)
    }
  }
  const reply = async (sessionId: string, id: string, png?: string, error?: string) => {
    try {
      await request({ action: 'board-capture', topicSessionId: sessionId, id,
        ...(png === undefined ? {} : { png }), ...(error === undefined ? {} : { error: error.slice(0, 500) }),
      }, abort.signal)
      completed.add(id)
      if (!abort.signal.aborted) store.update(draft => { draft.jobs = draft.jobs.filter(job => job.id !== id) })
    } catch (failure) {
      if (!abort.signal.aborted) report(failure)
    }
  }
  void poll()
  return { getSnapshot: store.getSnapshot, subscribe: store.subscribe, reply, dispose: () => { abort.abort(); clearTimeout(timer); store.update(draft => { draft.jobs = [] }) } }
}
