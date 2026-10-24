import type { MainQuote } from '../main-quote.ts'
import { quotePreview } from '../main-quote.ts'
import { t, useLocale } from '../i18n.ts'
import css from './QuoteReference.module.css'

/**
 * A quote the user sent to the main agent, drawn inside the sent message like DSH's own
 * reference chips: a quote mark and a short preview; the whole passage is in the tooltip.
 * @param node - the matched quote, from Citer's user-text rule.
 */
export function QuoteReference({ node }: { readonly node: { readonly data: MainQuote } }) {
  useLocale()
  const { from, text } = node.data
  const title = `${t(from === 'assistant' ? 'settings.quote.fromAssistant' : from === 'user' ? 'settings.quote.fromUser' : 'settings.quote.fromTool')}\n${text}`
  return <span className={css.chip} data-ref-chip="citeciter-quote" title={title}>
    <svg className={css.icon} viewBox="0 0 16 16" aria-hidden="true"><path d="M3 9.5c0-2.6 1.2-4.3 3.4-5.2l.5 1C5.6 6 5 7 5 8h1.6c.5 0 .9.4.9.9v2.4c0 .5-.4.9-.9.9H3.9a.9.9 0 0 1-.9-.9V9.5Zm6 0c0-2.6 1.2-4.3 3.4-5.2l.5 1C11.6 6 11 7 11 8h1.6c.5 0 .9.4.9.9v2.4c0 .5-.4.9-.9.9H9.9a.9.9 0 0 1-.9-.9V9.5Z" /></svg>
    {quotePreview(text)}
  </span>
}
