import { jsx as _jsx } from "react/jsx-runtime";
import { CodeBlock } from '@deepseek-ai/dsh-client-ui-primitives';
import { markdownLabels } from "../copy.js";
import { RichAnswer } from "./RichAnswer.js";
/** Render the explicit example kind; even HTML/SVG source stays literal code. */
export function LearningExample({ example }) {
    return example.kind === 'code'
        ? _jsx(CodeBlock, { code: example.content, lang: example.language, streaming: false, ...markdownLabels.code })
        : _jsx(RichAnswer, { text: example.content, streaming: false });
}
