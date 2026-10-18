import { z } from 'zod'
import { boardSnapshotSchema } from './board.ts'
import { ANIMATION_MAX_DURATION_MS } from './board-animation.ts'

/** Immutable board revision requested by one real model tool call, independent of UI selection. */
export const boardCaptureJobSchema = z.object({
  id: z.string().min(1),
  sessionId: z.string().min(1),
  board: boardSnapshotSchema,
  /** Render the board's timeline frozen at this time instead of its resting state. */
  atMs: z.number().int().min(0).max(ANIMATION_MAX_DURATION_MS).optional(),
}).strict()

export type BoardCaptureJob = z.infer<typeof boardCaptureJobSchema>
