import { type FormEvent, useMemo, useState } from 'react'
import { IconQuestionOutline14 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CompanionFace } from '../companion-controller.ts'
import type { PendingQuestion, QuestionAnswer } from '../../topic.ts'
import css from './CiteCiter.module.css'

interface DraftAnswer {
  readonly selected: readonly string[]
  readonly custom: string
}

export interface QuestionCardProps {
  readonly companion: CompanionFace
  readonly pending: PendingQuestion
}

/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
export function QuestionCard({ companion, pending }: QuestionCardProps) {
  const [page, setPage] = useState(0)
  const [drafts, setDrafts] = useState<Record<string, DraftAnswer>>({})
  const question = pending.questions[page]
  const complete = useMemo(() => pending.questions.every((item) => {
    const draft = drafts[item.id]
    return draft !== undefined && (draft.selected.length > 0 || draft.custom.trim() !== '')
  }), [drafts, pending.questions])
  if (question === undefined) return null
  const draft = drafts[question.id] ?? { selected: [], custom: '' }
  const update = (next: DraftAnswer) => setDrafts((current) => ({ ...current, [question.id]: next }))
  const choose = (label: string) => {
    if (question.multiSelect === true) {
      update({
        ...draft,
        selected: draft.selected.includes(label)
          ? draft.selected.filter((item) => item !== label)
          : [...draft.selected, label],
      })
      return
    }
    update({ selected: [label], custom: '' })
  }
  const submit = (event: FormEvent) => {
    event.preventDefault()
    if (!complete) return
    const answer: QuestionAnswer = {
      answers: pending.questions.map((item) => {
        const value = drafts[item.id] ?? { selected: [], custom: '' }
        const custom = value.custom.trim()
        return {
          id: item.id,
          selected: [...value.selected],
          ...(custom === '' ? {} : { custom }),
        }
      }),
    }
    void companion.answerQuestion(pending.key, answer)
  }

  return (
    <form className={css.questionFrame} onSubmit={submit} aria-label="CiteCiter 提问">
      <div className={css.questionHeader}>
        <IconQuestionOutline14 />
        <div>
          <span>{question.header ?? 'CiteCiter 需要你的回答'}</span>
          <strong>{question.question}</strong>
        </div>
        <span>{page + 1}/{pending.questions.length}</span>
      </div>
      {(question.options ?? []).length > 0 && (
        <div className={css.questionOptions}>
          {question.options?.map((option, index) => {
            const selected = draft.selected.includes(option.label)
            return (
              <button
                type="button"
                key={option.label}
                data-selected={selected || undefined}
                onClick={() => choose(option.label)}
              >
                <span>{question.multiSelect === true ? selected ? '✓' : '□' : index + 1}</span>
                <span><strong>{option.label}</strong>{option.description !== undefined && <small>{option.description}</small>}</span>
              </button>
            )
          })}
        </div>
      )}
      <textarea
        className={css.questionCustom}
        rows={2}
        value={draft.custom}
        placeholder={(question.options ?? []).length === 0 ? '输入回答…' : '其他（可填写）'}
        aria-label="自定义回答"
        onChange={(event) => update({
          selected: question.multiSelect === true ? draft.selected : [],
          custom: event.currentTarget.value,
        })}
      />
      <div className={css.questionFooter}>
        <button type="button" onClick={() => { void companion.cancelQuestion(pending.key) }}>取消</button>
        <span />
        {page > 0 && <button type="button" onClick={() => setPage(page - 1)}>上一个</button>}
        {page + 1 < pending.questions.length
          ? <button type="button" disabled={draft.selected.length === 0 && draft.custom.trim() === ''} onClick={() => setPage(page + 1)}>下一个</button>
          : <button type="submit" disabled={!complete}>提交回答</button>}
      </div>
    </form>
  )
}
