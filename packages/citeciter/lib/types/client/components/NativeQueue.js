import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import css from './NativeQueue.module.css';
/** Read and mutate the Host's authoritative inbox. Citer never owns a second queue. */
export function NativeQueue({ sessionId, native }) {
    const [snapshot, setSnapshot] = useState();
    const [error, setError] = useState();
    useEffect(() => { setSnapshot(undefined); setError(undefined); return native.watch(sessionId, setSnapshot); }, [sessionId, native]);
    const rows = snapshot?.queue.filter(row => row.placement !== 'context') ?? [];
    const pending = snapshot?.pendingSubmissions ?? [];
    const readError = snapshot?.openState === 'error' ? snapshot.lastAgentError : null;
    if (rows.length === 0 && pending.length === 0 && error === undefined && readError === null)
        return null;
    return _jsxs("section", { className: css.queue, "aria-label": "DSH \u53D1\u9001\u961F\u5217", children: [error !== undefined && _jsx("p", { role: "alert", children: error }), readError !== null && _jsxs("p", { role: "alert", children: ["\u65E0\u6CD5\u8BFB\u53D6\u53D1\u9001\u72B6\u6001\uFF0C\u6B63\u5728\u91CD\u8FDE\uFF1A", readError] }), pending.map(row => _jsxs("div", { className: css.row, children: [_jsx("span", { children: "\u53D1\u9001\u4E2D" }), _jsx("p", { children: row.text || '附件' })] }, row.requestId)), rows.map(row => _jsxs("div", { className: css.row, children: [_jsx("span", { title: row.placement === 'steering' ? '将在当前回答的下一步处理' : '当前回答完成后处理', children: row.placement === 'steering' ? '插话' : '排队' }), _jsx("p", { title: row.text ?? row.preview, children: row.text ?? row.preview }), row.placement === 'queued' && _jsx("button", { type: "button", title: "\u73B0\u5728\u63D2\u8BDD", "aria-label": "\u5C06\u6B64\u6761\u6392\u961F\u6D88\u606F\u6539\u4E3A\u63D2\u8BDD", onClick: () => { void native.queue(sessionId, row.id, { kind: 'steer' }).catch(error => setError(String(error))); }, children: "\u2197" }), _jsx("button", { type: "button", title: "\u79FB\u51FA\u961F\u5217", "aria-label": "\u79FB\u9664\u6B64\u6761\u5F85\u5904\u7406\u6D88\u606F", onClick: () => { void native.queue(sessionId, row.id, { kind: 'remove' }).catch(error => setError(String(error))); }, children: "\u00D7" })] }, row.id))] });
}
