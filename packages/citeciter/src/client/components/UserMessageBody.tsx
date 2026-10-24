import { parseSentReferences } from '../draft-references.ts'
import { ReferenceAttachments } from './ReferenceAttachments.tsx'
import { RichAnswer } from './RichAnswer.tsx'
import type { QuestionReply } from '../../question-reply.ts'
import { QuestionReplyBody } from './QuestionReplyBody.tsx'

const STAGE_PREFIX = '【学习阶段：'
const ASKED = '\n\n我的问题：'

/**
 * Read-only presentation of a committed user message. Attachments remain inspectable as reference
 * chips and formulas are rendered without mutating the durable prompt. A learning-stage prompt
 * collapses to its stage line and the user's own question.
 */
export function UserMessageBody({ text, questionReply, sourceTitle, stageClassName }: {
  readonly text: string
  readonly questionReply?: QuestionReply | undefined
  readonly sourceTitle?: ((sessionId: string) => string | undefined) | undefined
  readonly stageClassName?: string | undefined
}) {
  if (questionReply !== undefined) return <QuestionReplyBody reply={questionReply} />
  const { question, references } = parseSentReferences(text)
  const chips = references.length > 0 && <ReferenceAttachments references={references} sourceTitle={sourceTitle} />
  if (question.startsWith(STAGE_PREFIX)) {
    const stage = question.split('\n')[0] ?? ''
    const asked = question.includes(ASKED) ? question.split(ASKED).slice(1).join(ASKED).trim() : ''
    return <>{chips}<details className={stageClassName}><summary>{stage}{asked === '' ? '' : ` · ${asked}`}</summary><p>{question}</p></details></>
  }
  return <>{chips}{question !== '' && <RichAnswer text={question} streaming={false} />}</>
}
