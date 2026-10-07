import { type ReactNode, useEffect, useMemo, useReducer } from 'react'
import type { PendingQuestion } from '../../topic.ts'
import type { NativeComposer } from '../native-composer.ts'
import { useNativeQuestionInteraction } from '../question-interaction.ts'
import type { TopicQuestionController } from '../topic-question-controller.ts'
import { QuestionCard } from './QuestionCard.tsx'

function TopicQuestion({ pending, controller }: { readonly pending: PendingQuestion; readonly controller: TopicQuestionController }) {
  const { interaction, surface } = useNativeQuestionInteraction(controller)
  const failure = controller.getSnapshot().error
  return <>
    {failure !== undefined && <p role="alert">{failure}</p>}
    <QuestionCard pending={pending} interaction={interaction} surface={surface} draftStore={controller}
      onAnswer={answer => controller.answer(answer)} onCancel={() => controller.dismiss()} />
  </>
}

/** Private Topic questions share native wait semantics without joining the Host's Session list. */
export function TopicQuestions({ sessionId, pending, native, children }: {
  readonly sessionId: string
  readonly pending: readonly PendingQuestion[]
  readonly native: NativeComposer
  readonly children: ReactNode
}) {
  const [, render] = useReducer(value => value + 1, 0)
  const cards = useMemo(() => pending.map(question => ({ question, controller: native.question(sessionId, question) })), [native, sessionId, pending])
  useEffect(() => {
    const releases = cards.map(card => card.controller.subscribe(render))
    native.syncQuestions(sessionId, pending)
    return () => { for (const release of releases) release() }
  }, [cards, native, pending, sessionId])
  const answerable = cards.filter(card => !card.controller.getSnapshot().closed)
  const visible = answerable.find(card => !card.controller.getSnapshot().hidden)
  return <>
    {answerable.length > 0 && (answerable.length > 1 || visible === undefined) && <div aria-label="待回答问题">
      {answerable.map((card, index) => <button type="button" key={card.question.key}
        disabled={visible?.controller.dismissal === 'cancel' && visible !== card}
        aria-pressed={visible === card} onClick={() => {
          for (const other of answerable) {
            if (other !== card && other.controller.dismissal === 'hide') void other.controller.dismiss()
          }
          card.controller.reveal()
        }}>{card.question.questions[0]?.header ?? `问题 ${index + 1}`}{card.question.state === 'continued' ? ' · 可补答' : ''}</button>)}
    </div>}
    {visible === undefined ? children : <TopicQuestion key={visible.question.key} pending={visible.question} controller={visible.controller} />}
  </>
}
