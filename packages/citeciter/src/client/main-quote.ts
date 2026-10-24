/**
 * Quoting a passage of the main conversation into its own composer, as a DSH reference chip.
 *
 * Citer registers an `@` reference source with DSH's input triggers. The chip shows a short
 * preview in the composer; when the user sends, DSH asks the source to serialize the chip and the
 * main agent receives `<quote from="…">passage</quote>` in place of it: the exact passage and who
 * said it, nothing else. DSH 0.2.1-rc.2 and later also render that text as a chip in the sent
 * message (see `user-text-quote.ts`).
 */
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { InputTriggerSource } from '@deepseek-ai/dsh-client-ui-input-trigger/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'
import { t } from './i18n.ts'

/** Name of Citer's reference source; DSH routes chip serialization by it. */
export const QUOTE_SOURCE = 'citeciter-quote'

/** Who said the quoted passage, in the main agent's own terms. */
export type QuoteOrigin = 'assistant' | 'user' | 'tool'

/** One quoted passage of the main conversation. */
export interface MainQuote {
  readonly from: QuoteOrigin
  readonly text: string
}

const ORIGINS: readonly QuoteOrigin[] = ['assistant', 'user', 'tool']
const PREVIEW_LENGTH = 32

/** @returns the chip's reference id: the quote itself, so a restored draft still serializes it. */
export function encodeQuote(quote: MainQuote): string {
  return JSON.stringify({ from: quote.from, text: quote.text })
}

/** Read a chip's reference id field by field; drafts persist it across reloads and versions. */
export function decodeQuote(ref: string): MainQuote | undefined {
  let value: unknown
  try {
    value = JSON.parse(ref)
  } catch {
    // SyntaxError: not a Citer quote reference.
    return undefined
  }
  if (typeof value !== 'object' || value === null) return undefined
  const { from, text } = value as { from?: unknown, text?: unknown }
  if (typeof text !== 'string' || text.trim() === '' || !ORIGINS.includes(from as QuoteOrigin)) return undefined
  return { from: from as QuoteOrigin, text }
}

/** What the main agent receives for one chip. */
export function quoteModelText(quote: MainQuote): string {
  return `<quote from="${quote.from}">\n${quote.text}\n</quote>`
}

/** Matches {@link quoteModelText} in sent text, for rendering it as a chip again. */
const QUOTE_PATTERN = /<quote from="(assistant|user|tool)">\n([\s\S]*?)\n<\/quote>/gu

/**
 * Find the next serialized quote at or after `from` in sent message text.
 * @returns its range and content, or undefined when there is none.
 */
export function findQuote(text: string, from: number): { readonly start: number, readonly end: number, readonly quote: MainQuote } | undefined {
  QUOTE_PATTERN.lastIndex = from
  const match = QUOTE_PATTERN.exec(text)
  if (match === null || match[2]!.trim() === '') return undefined
  return { start: match.index, end: match.index + match[0].length, quote: { from: match[1] as QuoteOrigin, text: match[2]! } }
}

/** One line of the passage, short enough for a chip. */
export function quotePreview(text: string): string {
  const line = text.replace(/\s+/gu, ' ').trim()
  return line.length <= PREVIEW_LENGTH ? line : `${line.slice(0, PREVIEW_LENGTH - 1)}…`
}

/** Markdown blockquote, used when the chip is copied out of the composer. */
export function markdownQuote(passage: string): string {
  const text = passage.trim()
  if (text === '') throw new Error(t('settings.error.selectQuote'))
  return text.split(/\r\n?|\n/u).map(line => line === '' ? '>' : `> ${line}`).join('\n')
}

/**
 * The composer's end in DSH's detect coordinates, where every chip counts as one character.
 * The draft text shows chips in their clipboard form, so their extra length is taken off.
 * @param draft - the composer's draft text (clipboard projection).
 * @param chips - reference chips with their clipboard lengths.
 * @param commandToken - the leading command chip's token while one is claimed.
 */
export function composerEnd(draft: string, chips: readonly { readonly length: number }[], commandToken?: string): number {
  const folded = chips.reduce((total, chip) => total + chip.length - 1, 0)
  return draft.length - folded - (commandToken === undefined ? 0 : commandToken.length - 1)
}

/** Citer's `@` source: it offers no menu candidates and only serializes the chips Citer inserts. */
function quoteSource(): InputTriggerSource {
  return {
    trigger: '@',
    name: QUOTE_SOURCE,
    showGroupTitle: false,
    candidates: () => Promise.resolve([]),
    onPick: () => undefined,
    codec: {
      clipboardText: (ref) => {
        const quote = decodeQuote(ref)
        return quote === undefined ? ref : markdownQuote(quote.text)
      },
      serialize: (ref) => {
        const quote = decodeQuote(ref)
        // DSH blocks the send instead of sending a broken reference.
        return quote === undefined ? Promise.reject(new Error(t('settings.error.quoteUnreadable'))) : Promise.resolve(quoteModelText(quote))
      },
    },
  }
}

/** Whether Citer's reference source is registered; chips are only inserted while it is. */
let sourceReady = false

/**
 * Register Citer's quote source with DSH's input triggers for the lifetime of `ctx`.
 * @param ctx - Client root context.
 */
export function installQuoteSource(ctx: Context): void {
  ctx.inject(['inputTriggers'], (triggerCtx) => {
    triggerCtx.effect(() => {
      const release = triggerCtx.inputTriggers.registerSource(quoteSource())
      sourceReady = true
      return () => {
        sourceReady = false
        release()
      }
    }, 'citeciter: quote reference source')
  })
}

/**
 * Add a quote chip at the end of the still-current main Session's composer and focus it.
 * Never sends; the user's existing text and chips stay as they are.
 */
export function insertMainQuote(ctx: Context, sessionId: SessionId, quote: MainQuote): void {
  const binding = ctx.sessions.binding(sessionId)
  const scope = ctx.sessions.scope(sessionId)
  if (binding === undefined || scope === undefined || ctx.uiSession.adapter.current.getSnapshot().key !== sessionId) {
    throw new Error(t('settings.error.sourceChanged'))
  }
  if (!sourceReady) throw new Error(t('settings.error.quoteUnavailable'))
  const composer = ctx.conversation.input.for(scope)
  const state = composer.state.getSnapshot()
  const end = composerEnd(state.draft, state.occurrences, state.claim?.token)
  const inserted = composer.insertReference({
    source: QUOTE_SOURCE,
    ref: encodeQuote(quote),
    label: `“${quotePreview(quote.text)}”`,
    clipboardText: markdownQuote(quote.text),
  }, { start: end, end, draftRev: state.draftRev })
  if (!inserted) throw new Error(t('settings.error.mainSubmitting'))
  composer.focus()
  // Focus restores the caret from before the user selected text elsewhere, often the start; the
  // comment belongs after the quote. The composer adopts a DOM caret move like a click.
  requestAnimationFrame(() => {
    const root = document.activeElement
    if (!(root instanceof HTMLElement) || !root.isContentEditable) return
    const selection = root.ownerDocument.getSelection()
    selection?.selectAllChildren(root)
    selection?.collapseToEnd()
  })
}
