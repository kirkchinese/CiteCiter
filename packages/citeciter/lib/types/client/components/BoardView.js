import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef } from 'react';
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import { EMPTY_BOARD_SNAPSHOT, } from "../../board.js";
import { isSafeSvg, isolatedHtmlDocument, neutralizeMarkdownImages } from "../rich-content.js";
import css from './BoardView.module.css';
function inlineStyle(style) {
    return {
        ...(style.color === undefined ? {} : { color: style.color }),
        ...(style.fontSize === undefined ? {} : { fontSize: style.fontSize }),
    };
}
function MathElement({ content }) {
    const ref = useRef(null);
    useEffect(() => {
        if (ref.current === null)
            return;
        try {
            katex.render(content, ref.current, { throwOnError: false, displayMode: false });
        }
        catch {
            ref.current.textContent = content;
        }
    }, [content]);
    return _jsx("div", { ref: ref, className: css.math });
}
function ElementBody({ kind, content }) {
    if (kind === 'math')
        return _jsx(MathElement, { content: content });
    if (kind === 'markdown' || kind === 'table') {
        return _jsx(MarkdownText, { text: neutralizeMarkdownImages(content), streaming: false });
    }
    if (kind === 'svg') {
        if (!isSafeSvg(content))
            return _jsx("pre", { className: css.fallback, children: content });
        return (_jsx("img", { className: css.svg, src: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(content.trim())}`, alt: "CiteCiter \u9ED1\u677F\u56FE\u5F62" }));
    }
    if (kind === 'html') {
        return (_jsx("iframe", { className: css.html, title: "CiteCiter \u9ED1\u677F\u52A8\u753B", sandbox: "", referrerPolicy: "no-referrer", srcDoc: isolatedHtmlDocument(content) }));
    }
    if (kind === 'image') {
        if (!/^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,/u.test(content)) {
            return _jsx("pre", { className: css.fallback, children: "\u9ED1\u677F\u56FE\u7247\u5185\u5BB9\u65E0\u6548" });
        }
        return _jsx("img", { className: css.image, src: content, alt: "CiteCiter \u9ED1\u677F\u56FE\u7247" });
    }
    return _jsx("div", { className: css.text, children: content });
}
function animationClass(name) {
    if (name === 'fade-in')
        return css.animFadeIn;
    if (name === 'slide-in')
        return css.animSlideIn;
    if (name === 'pulse')
        return css.animPulse;
    return css.animHighlight;
}
/**
 * Render one final-state blackboard projection in the main conversation workspace.
 * @param props - board snapshot, motion preference, and optional citation action.
 * @returns the safe blackboard canvas.
 */
export function BoardView({ snapshot, animations, onQuoteElement, }) {
    const board = snapshot ?? EMPTY_BOARD_SNAPSHOT;
    return (_jsxs("section", { className: css.board, "data-citeciter-board": true, "data-animations": animations || undefined, "aria-label": "CiteCiter \u9ED1\u677F", children: [_jsxs("header", { className: css.boardHeader, children: [_jsxs("div", { children: [_jsx("strong", { children: "\u5C0F\u9ED1\u677F" }), _jsx("span", { children: "\u7531 CiteCiter \u968F\u8BB2\u89E3\u5B9E\u65F6\u6574\u7406" })] }), _jsx("span", { children: board.revision === 0 && board.elements.length === 0 ? '等待板书' : `第 ${board.revision} 次更新` })] }), board.invalid > 0 && _jsxs("p", { className: css.boardWarning, role: "status", children: ["\u5DF2\u5FFD\u7565 ", board.invalid, " \u6279\u65E0\u6548\u677F\u4E66\u63D0\u4EA4"] }), _jsx("div", { className: css.canvas, children: board.elements.length === 0 ? (_jsx("p", { className: css.boardHint, children: "\u521B\u5EFA\u8BB2\u89E3 Topic \u540E\uFF0C\u63D0\u7EB2\u3001\u516C\u5F0F\u548C\u56FE\u793A\u4F1A\u9010\u6B65\u51FA\u73B0\u5728\u8FD9\u91CC\u3002" })) : board.elements.map((element) => (_jsxs("div", { className: css.elementWrap, "data-board-element": element.id, "data-kind": element.kind, "data-focused": element.focused || undefined, style: {
                        left: `${element.x}%`,
                        top: `${element.y}%`,
                        width: `${element.w}%`,
                        height: `${element.h}%`,
                    }, children: [_jsx("div", { className: [
                                css.elementInner,
                                element.animation === undefined || !animations ? undefined : animationClass(element.animation.name),
                            ].filter((entry) => entry !== undefined).join(' '), style: {
                                ...inlineStyle(element.style),
                                ...(element.animation === undefined || !animations ? {} : {
                                    animationDuration: `${element.animation.durationMs}ms`,
                                    animationIterationCount: String(element.animation.iterations),
                                }),
                            }, children: _jsx(ElementBody, { kind: element.kind, content: element.content }) }), onQuoteElement !== undefined && (_jsx("button", { className: css.quoteButton, type: "button", onClick: () => onQuoteElement(element), "aria-label": `引用黑板元素 ${element.id} 到提问`, children: "\u5F15\u7528\u5230\u63D0\u95EE" }))] }, `${element.id}:${element.animation?.run ?? 0}`))) })] }));
}
