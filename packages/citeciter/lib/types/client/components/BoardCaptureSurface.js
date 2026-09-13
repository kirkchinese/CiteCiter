import { jsx as _jsx } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { toPng } from 'html-to-image';
import { findVisibleCaptureBoard } from "../board-capture-target.js";
import { BoardView } from "./BoardView.js";
/** Reuses the exact board renderer when its visible tab is closed; no synthetic drawing or extra conversation is created. */
export function BoardCaptureSurface({ id, sessionId, board, reply }) {
    const ref = useRef(null);
    const sent = useRef(false);
    useEffect(() => {
        let disposed = false;
        const capture = async () => {
            await document.fonts.ready;
            await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
            if (disposed || sent.current || ref.current === null)
                return;
            sent.current = true;
            try {
                const visible = findVisibleCaptureBoard(sessionId, board?.revision ?? 0, ref.current);
                const target = visible ?? ref.current.firstElementChild;
                if (target.querySelector('iframe'))
                    throw new Error('隔离 HTML 动画不能截取；请改用 SVG 板书');
                const data = await toPng(target, { pixelRatio: 1, cacheBust: false, filter: node => !(node instanceof Element) || node.tagName !== 'BUTTON', style: { animation: 'none', transform: 'none' } });
                if (!disposed)
                    await reply(sessionId, id, data.slice(data.indexOf(',') + 1));
            }
            catch (error) {
                if (!disposed)
                    await reply(sessionId, id, undefined, error instanceof Error ? error.message : String(error));
            }
        };
        void capture();
        return () => { disposed = true; };
    }, [id, sessionId, reply]);
    return _jsx("div", { ref: ref, "aria-hidden": "true", style: { position: 'fixed', left: -10000, top: 0, width: 1000, height: 680, display: 'flex', pointerEvents: 'none' }, children: _jsx(BoardView, { sessionId: sessionId, snapshot: board, animations: false }) });
}
