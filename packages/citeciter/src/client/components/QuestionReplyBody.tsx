import { t, useLocale } from '../i18n.ts'
import type { QuestionReply } from '../../question-reply.ts'
import css from './QuestionReplyBody.module.css'

/** Show the user's recorded choices as text, without interpreting their answer as Markdown or replaying internal prompts. */
export function QuestionReplyBody({ reply }: { readonly reply: QuestionReply }) {
  useLocale()
  return <section className={css.reply} aria-label={t('panel.question.replyLabel')}>
    <span className={css.label}>{t('panel.question.reply')}</span>
    {reply.items.length === 0 ? <p>{t('panel.question.invalidReply')}</p> : <dl className={css.pairs}>
      {reply.items.map(item => <div key={item.id}>
        <dt className={css.question}>
          {item.header !== undefined && item.header !== item.question && <span className={css.label}>{item.header} · </span>}
          {item.question}
        </dt>
        <dd className={css.answer}>{item.values.length === 0
          ? <span className={css.label}>{t('panel.question.skipped')}</span>
          : item.values.map((value, index) => <p key={index}>{value}</p>)}</dd>
      </div>)}
    </dl>}
  </section>
}
