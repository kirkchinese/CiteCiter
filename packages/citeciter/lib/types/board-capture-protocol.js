import { z } from 'zod';
import { boardSnapshotSchema } from "./board.js";
/** Immutable board revision requested by one real model tool call, independent of UI selection. */
export const boardCaptureJobSchema = z.object({
    id: z.string().min(1),
    sessionId: z.string().min(1),
    board: boardSnapshotSchema,
}).strict();
