import { useMemo } from 'react'
import { MarkdownText } from '@deepseek-ai/dsh-client-ui-primitives'
import { splitRichContent } from '../rich-content.ts'
import css from './CiteCiter.module.css'

/** Assistant response text and its current stream state. */
export interface RichAnswerProps {
  readonly text: string
  readonly streaming: boolean
}

/**
 * Render model Markdown plus safe SVG and sandboxed HTML fence previews.
 * @param props - response text and streaming flag.
 * @returns isolated rich-answer element.
 */
export function RichAnswer({ text, streaming }: RichAnswerProps) {
  const segments = useMemo(() => splitRichContent(text), [text])
  return (
    <div className={css.richAnswer} data-citeciter-answer>
      {segments.map((segment, index) => {
        const key = `${segment.kind}:${index}`
        if (segment.kind === 'svg') {
          return (
            <figure className={css.richFigure} key={key} data-citeciter-svg>
              <img className={css.richSvg} src={segment.dataUrl} alt="CiteCiter SVG explanation" />
            </figure>
          )
        }
        if (segment.kind === 'html') {
          return (
            <figure className={css.richFigure} key={key} data-citeciter-html>
              <iframe
                className={css.richHtml}
                title="CiteCiter HTML explanation"
                sandbox=""
                referrerPolicy="no-referrer"
                srcDoc={segment.document}
              />
            </figure>
          )
        }
        return <MarkdownText key={key} text={segment.text} streaming={streaming} />
      })}
    </div>
  )
}
