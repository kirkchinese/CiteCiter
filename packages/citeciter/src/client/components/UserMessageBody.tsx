import { parseSentReferences } from '../draft-references.ts'
import { ReferenceAttachments } from './ReferenceAttachments.tsx'
import { RichAnswer } from './RichAnswer.tsx'
import type { QuestionReply } from '../../question-reply.ts'
import { QuestionReplyBody } from './QuestionReplyBody.tsx'

/** Read-only presentation of a committed user message. Attachments remain inspectable and formulas are rendered without mutating the durable prompt. */
export function UserMessageBody({ text, questionReply }: { readonly text: string; readonly questionReply?: QuestionReply | undefined }) {
  if (questionReply !== undefined) return <QuestionReplyBody reply={questionReply} />
  const { question, references } = parseSentReferences(text)
  return <>{references.length > 0 && <ReferenceAttachments references={references} />}{question !== '' && <RichAnswer text={question} streaming={false} />}</>
}
