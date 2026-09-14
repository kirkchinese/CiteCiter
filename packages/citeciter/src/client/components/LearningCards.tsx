import { useState } from 'react'
import { learningCardsMarkdown, type LearningCard, type LearningCardsProjection } from '../../learning.ts'
import { RichAnswer } from './RichAnswer.tsx'
import css from './LearningWorkspace.module.css'

function Card({ card, recall, index }: { readonly card: LearningCard, readonly recall: boolean, readonly index: number }) {
  const [revealed, setRevealed] = useState(false)
  const showAnswer = !recall || revealed
  return (
    <article className={css.card}>
      <div className={css.cardEyebrow}>学习卡片 · {String(index + 1).padStart(2, '0')}</div>
      <h3>{card.title}</h3>
      {recall && <div className={css.recallQuestion}><strong>先试着用自己的话回答</strong><RichAnswer text={card.question} streaming={false} /></div>}
      {showAnswer ? <>
        <RichAnswer text={card.summary} streaming={false} />
        <div className={css.example}><strong>用一个例子记住</strong><RichAnswer text={card.example} streaming={false} /></div>
        {recall && <div className={css.reference}><strong>参考答案</strong><RichAnswer text={card.answer} streaming={false} /></div>}
      </> : <button type="button" className={css.action} onClick={() => setRevealed(true)}>展开结论与参考答案</button>}
    </article>
  )
}

/** Read the latest durable Topic card set. Recall affects display only and never schedules work. */
export function LearningCards({ projection, recall, setRecall, disabled, topicTitle, topicId, source, onRevise }: {
  readonly projection: LearningCardsProjection
  readonly recall: boolean
  readonly setRecall: (value: boolean) => void
  readonly disabled: boolean
  readonly topicTitle: string
  readonly topicId: string
  readonly source: string
  readonly onRevise: () => void
}) {
  const markdown = learningCardsMarkdown(projection.cards, topicTitle, topicId, source)
  return (
    <section className={css.cards} aria-label="学习卡片">
      <header className={css.cardsHeader}>
        <div><span className={css.eyebrow}>留下一份理解</span><h2>总结学习卡片</h2></div>
        <label className={css.recallToggle}><input type="checkbox" checked={recall} disabled={disabled} onChange={event => setRecall(event.currentTarget.checked)} />主动回忆</label>
      </header>
      <p className={css.muted}>{recall ? '先自己回答，再展开参考内容。随时可以关闭。' : '直接阅读结论与例子。想自测时，再开启主动回忆。'}</p>
      {projection.invalid > 0 && <p role="status">有 {projection.invalid} 条卡片记录无法读取，已保留最近可用的一组。</p>}
      {projection.cards.length === 0 ? <div className={css.empty}>
        <span className={css.emptyGlyph} aria-hidden="true">▤</span>
        <h3>让理解留下来</h3>
        <p>在输入框请求总结学习卡片并发送。模型会先核对结论，再整理卡片。</p>
        <button className={css.action} type="button" onClick={onRevise}>准备总结</button>
      </div> : <>
        {projection.cards.map((card, index) => <Card key={`${projection.messageId}:${index}:${recall}`} card={card} index={index} recall={recall} />)}
        <div className={css.cardActions}>
          <a className={css.action} href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`} download="CiteCiter-learning-cards.md">导出 Markdown</a>
          <button className={css.action} type="button" onClick={onRevise}>补充或修订</button>
        </div>
        <details className={css.provenance}><summary>来自当前 Topic · {topicTitle}</summary><p>{source}</p><small>{topicId}</small></details>
        <p className={css.muted}>已随 Topic 保存。修订时发送你的要求，生成后展示新的完整一组。</p>
      </>}
    </section>
  )
}
