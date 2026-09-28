import { CodeBlock } from '@deepseek-ai/dsh-client-ui-primitives'
import type { LearningExample as Example } from '../../learning-example.ts'
import { markdownLabels } from '../copy.ts'
import { RichAnswer } from './RichAnswer.tsx'

/** Render the explicit example kind; even HTML/SVG source stays literal code. */
export function LearningExample({ example }: { readonly example: Example }) {
  return example.kind === 'code'
    ? <CodeBlock code={example.content} lang={example.language} streaming={false} {...markdownLabels.code} />
    : <RichAnswer text={example.content} streaming={false} />
}
