import { type FormEvent, type RefObject, useEffect, useMemo, useRef, useState } from 'react'
import { IconQuestionOutlineMedium } from '../host-icons.ts'
import type { AskUserQuestionAnswer } from '@deepseek-ai/dsh-user-questions'
import type { PendingQuestion } from '../../topic.ts'
import type { QuestionInteraction } from '../question-interaction.ts'
import type { QuestionDraft } from '../topic-question-controller.ts'
import { RichAnswer } from './RichAnswer.tsx'
import css from './CiteCiter.module.css'

interface DraftAnswer {
  readonly selected: readonly string[]
  readonly custom: string
}

export interface QuestionCardProps {
  readonly pending: { readonly key: string, readonly questions: readonly PendingQuestion['questions'][number][] }
  readonly onAnswer: (answer: AskUserQuestionAnswer) => Promise<unknown>
  readonly onCancel: () => Promise<unknown>
  readonly interaction?: QuestionInteraction
  readonly surface?: RefObject<HTMLFormElement>
  readonly draftStore?: { getDraft(): QuestionDraft; setDraft(draft: QuestionDraft): void }
}

/** Collect one standard DSH ask_user_question answer batch inside the private Topic. */
export function QuestionCard({ onAnswer, onCancel, pending, interaction, surface, draftStore }: QuestionCardProps) {
  const [page, setPage] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  const sentVia = useRef<'waterfall' | 'rpc' | undefined>(undefined)
  const readonly = interaction?.review !== undefined
  const locked = busy || readonly
  useEffect(() => {
    // An answer sent at the deadline may lose the Host's waterfall race.
    // Keep the text and re-enable the same form when the late-reply channel opens.
    if (sentVia.current !== 'waterfall' || interaction?.state !== 'continued') return
    sentVia.current = undefined
    setBusy(false)
    setError('模型已继续，回答仍保留，请再次提交。')
  }, [interaction?.state])
  const run = (action: () => Promise<unknown>) => {
    if (busy) return
    setBusy(true)
    setError(undefined)
    void action().catch(error => { setError(String(error)); setBusy(false) })
  }
  const [drafts, setDrafts] = useState<Readonly<Record<string, DraftAnswer>>>(() => draftStore?.getDraft() ?? Object.fromEntries(
    (interaction?.review ?? []).map(answer => [answer.id, { selected: [...answer.selected], custom: answer.custom ?? '' }]),
  ))
  const question = pending.questions[page]
  const complete = useMemo(() => pending.questions.every((item) => {
    const draft = drafts[item.id]
    return draft !== undefined && (interaction?.allowSkip === true || draft.selected.length > 0 || draft.custom.trim() !== '')
  }), [drafts, pending.questions, interaction?.allowSkip])
  if (question === undefined || interaction?.closed) return null
  const draft = drafts[question.id] ?? { selected: [], custom: '' }
  const update = (next: DraftAnswer) => {
    if (locked) return
    interaction?.edit()
    const value = { ...drafts, [question.id]: next }
    draftStore?.setDraft(value)
    setDrafts(value)
  }
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
    if (!complete || locked || interaction?.channel === 'none') return
    const answer: AskUserQuestionAnswer = {
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
    sentVia.current = interaction?.channel
    run(() => onAnswer(answer))
  }

  return (
    <form ref={surface} className={css.questionFrame} onSubmit={submit} aria-label="CiteCiter 提问"
      onFocus={event => { if (!event.currentTarget.contains(event.relatedTarget)) interaction?.focus() }}
      onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) interaction?.blur() }}>
      <div className={css.questionHeader}>
        <IconQuestionOutlineMedium />
        <div>
          <span>{question.header ?? 'CiteCiter 需要你的回答'}</span>
          <strong>{question.question}</strong>
        </div>
        <span>{page + 1}/{pending.questions.length}</span>
      </div>
      {question.detail !== undefined && <RichAnswer text={question.detail} streaming={false} />}
      {interaction?.status !== undefined && <p role="status">{interaction.status}</p>}
      {error !== undefined && <p role="alert">{error}</p>}
      {(question.options ?? []).length > 0 && (
        <div className={css.questionOptions}>
          {question.options?.map((option, index) => {
            const selected = draft.selected.includes(option.label)
            return (
              <button
                type="button"
                key={option.label}
                disabled={locked}
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
        disabled={locked}
        value={draft.custom}
        placeholder={(question.options ?? []).length === 0 ? '输入回答…' : '其他（可填写）'}
        aria-label="自定义回答"
        onChange={(event) => update({
          selected: question.multiSelect === true ? draft.selected : [],
          custom: event.currentTarget.value,
        })}
      />
      <div className={css.questionFooter}>
        <button type="button" disabled={busy} onClick={() => run(onCancel)}>{interaction?.dismissLabel ?? '取消'}</button>
        {interaction?.canTakeTime && <button type="button" disabled={busy} onClick={() => interaction.takeTime()}>等我回答</button>}
        {interaction?.allowSkip && !readonly && <button type="button" disabled={busy} onClick={() => {
          update({ selected: [], custom: '' })
          if (page + 1 < pending.questions.length) setPage(page + 1)
        }}>跳过此题</button>}
        <span />
        {page > 0 && <button type="button" onClick={() => setPage(page - 1)}>上一个</button>}
        {page + 1 < pending.questions.length
          ? <button type="button" disabled={!readonly && (drafts[question.id] === undefined || (!interaction?.allowSkip && draft.selected.length === 0 && draft.custom.trim() === ''))} onClick={() => setPage(page + 1)}>下一个</button>
          : !readonly && <button type="submit" disabled={!complete || busy || interaction?.channel === 'none'}>{busy ? '提交中…' : '提交回答'}</button>}
      </div>
    </form>
  )
}
