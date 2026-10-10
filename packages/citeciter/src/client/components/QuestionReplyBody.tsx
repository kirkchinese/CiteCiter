import type { QuestionReply } from '../../question-reply.ts'
import css from './QuestionReplyBody.module.css'

/** Show the user's recorded choices as text, without interpreting their answer as Markdown or replaying internal prompts. */
export function QuestionReplyBody({ reply }: { readonly reply: QuestionReply }) {
  return <section className={css.reply} aria-label="补答先前的问题">
    <span className={css.label}>补答</span>
    {reply.items.length === 0 ? <p>这条历史回答的格式无法解析。</p> : <dl className={css.pairs}>
      {reply.items.map(item => <div key={item.id}>
        <dt className={css.question}>
          {item.header !== undefined && item.header !== item.question && <span className={css.label}>{item.header} · </span>}
          {item.question}
        </dt>
        <dd className={css.answer}>{item.values.length === 0
          ? <span className={css.label}>已跳过</span>
          : item.values.map((value, index) => <p key={index}>{value}</p>)}</dd>
      </div>)}
    </dl>}
  </section>
}
