import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { BoardCaptureSurface } from "./BoardCaptureSurface.js";
/** Root-owned render workers survive panel close, Topic changes and source navigation. */
export function BoardCaptureWorker({ useCapture, reply }) {
    const jobs = useCapture(value => value.jobs);
    return _jsx(_Fragment, { children: jobs.map(job => _jsx(BoardCaptureSurface, { id: job.id, sessionId: job.sessionId, board: job.board, reply: reply }, job.id)) });
}
