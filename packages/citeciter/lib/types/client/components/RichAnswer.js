import { jsx as _jsx } from "react/jsx-runtime";
import { useMemo } from 'react';
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives';
import { splitRichContent } from "../rich-content.js";
import css from './CiteCiter.module.css';
/**
 * Render model Markdown plus safe SVG and sandboxed HTML fence previews.
 * @param props - response text and streaming flag.
 * @returns isolated rich-answer element.
 */
export function RichAnswer({ text, streaming }) {
    const segments = useMemo(() => splitRichContent(text), [text]);
    return (_jsx("div", { className: css.richAnswer, "data-citeciter-answer": true, children: segments.map((segment, index) => {
            const key = `${segment.kind}:${index}`;
            if (segment.kind === 'svg') {
                return (_jsx("figure", { className: css.richFigure, "data-citeciter-svg": true, children: _jsx("img", { className: css.richSvg, src: segment.dataUrl, alt: "CiteCiter SVG explanation" }) }, key));
            }
            if (segment.kind === 'html') {
                return (_jsx("figure", { className: css.richFigure, "data-citeciter-html": true, children: _jsx("iframe", { className: css.richHtml, title: "CiteCiter HTML explanation", sandbox: "", referrerPolicy: "no-referrer", srcDoc: segment.document }) }, key));
            }
            return _jsx(MarkdownText, { text: segment.text, streaming: streaming }, key);
        }) }));
}
