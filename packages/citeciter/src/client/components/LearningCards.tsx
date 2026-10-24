import { useState } from 'react'
import { learningCardsMarkdown, type LearningCard, type LearningCardsProjection } from '../../learning.ts'
import { learningExampleMarkdown } from '../../learning-example.ts'
import { isChinese, t, useLocale } from '../i18n.ts'
import { RichAnswer } from './RichAnswer.tsx'
import { LearningExample } from './LearningExample.tsx'
import css from './LearningWorkspace.module.css'

function Card({ card, recall, index }: { readonly card: LearningCard, readonly recall: boolean, readonly index: number }) {
  useLocale()
  const [revealed, setRevealed] = useState(false)
  const showAnswer = !recall || revealed
  return (
    <article className={css.card}>
      <div className={css.cardEyebrow}>{t('board.cards.eyebrow', { number: String(index + 1).padStart(2, '0') })}</div>
      <h3>{card.title}</h3>
      {recall && <div className={css.recallQuestion}><strong>{t('board.cards.question')}</strong><RichAnswer text={card.question} streaming={false} /></div>}
      {showAnswer ? <>
        <RichAnswer text={card.summary} streaming={false} />
        <div className={css.example}><strong>{t('board.cards.example')}</strong><LearningExample example={card.example} /></div>
        {recall && <div className={css.reference}><strong>{t('board.cards.answer')}</strong><RichAnswer text={card.answer} streaming={false} /></div>}
      </> : <button type="button" className={css.action} onClick={() => setRevealed(true)}>{t('board.cards.reveal')}</button>}
    </article>
  )
}

function exportedCards(cards: readonly LearningCard[], topicTitle: string, topicId: string, source: string): string {
  if (isChinese()) return learningCardsMarkdown(cards, topicTitle, topicId, source)
  return `# ${topicTitle}\n\nTopic: ${topicId}\n\n${t('board.cards.markdown.source')} ${source}\n\n${cards.map((card, index) => `## ${index + 1}. ${card.title}\n\n${card.summary}\n\n**${t('board.cards.markdown.example')}**\n\n${learningExampleMarkdown(card.example)}\n\n**${t('board.cards.markdown.selfTest')}**\n\n${card.question}\n\n**${t('board.cards.answer')}**\n\n${card.answer}`).join('\n\n---\n\n')}\n`
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
  useLocale()
  const markdown = exportedCards(projection.cards, topicTitle, topicId, source)
  return (
    <section className={css.cards} aria-label={t('board.cards.label')}>
      <header className={css.cardsHeader}>
        <div><span className={css.eyebrow}>{t('board.cards.kicker')}</span><h2>{t('board.cards.title')}</h2></div>
        <label className={css.recallToggle}><input type="checkbox" checked={recall} disabled={disabled} onChange={event => setRecall(event.currentTarget.checked)} />{t('board.cards.recall')}</label>
      </header>
      <p className={css.muted}>{t(recall ? 'board.cards.recallOn' : 'board.cards.recallOff')}</p>
      {projection.invalid > 0 && <p role="status">{t('board.cards.invalid', { count: projection.invalid })}</p>}
      {projection.cards.length === 0 ? <div className={css.empty}>
        <span className={css.emptyGlyph} aria-hidden="true">▤</span>
        <h3>{t('board.cards.empty.title')}</h3>
        <p>{t('board.cards.empty.description')}</p>
        <button className={css.action} type="button" onClick={onRevise}>{t('board.cards.prepare')}</button>
      </div> : <>
        {projection.cards.map((card, index) => <Card key={`${projection.messageId}:${index}:${recall}`} card={card} index={index} recall={recall} />)}
        <div className={css.cardActions}>
          <a className={css.action} href={`data:text/markdown;charset=utf-8,${encodeURIComponent(markdown)}`} download="CiteCiter-learning-cards.md">{t('board.cards.export')}</a>
          <button className={css.action} type="button" onClick={onRevise}>{t('board.cards.revise')}</button>
        </div>
        <details className={css.provenance}><summary>{t('board.cards.provenance', { title: topicTitle })}</summary><p>{source}</p><small>{topicId}</small></details>
        <p className={css.muted}>{t('board.cards.saved')}</p>
      </>}
    </section>
  )
}
