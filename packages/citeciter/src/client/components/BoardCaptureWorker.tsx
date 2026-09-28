import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { BoardCaptureSnapshot, createBoardCaptureController } from '../board-capture-controller.ts'
import { BoardCaptureSurface } from './BoardCaptureSurface.tsx'

/** Root-owned render workers survive panel close, Topic changes and source navigation. */
export function BoardCaptureWorker({ useCapture, reply }: {
  readonly useCapture: SnapshotSelectorHook<BoardCaptureSnapshot>
  readonly reply: ReturnType<typeof createBoardCaptureController>['reply']
}) {
  const jobs = useCapture(value => value.jobs)
  return <>{jobs.map(job => <BoardCaptureSurface key={job.id} id={job.id} sessionId={job.sessionId} board={job.board} reply={reply} />)}</>
}
