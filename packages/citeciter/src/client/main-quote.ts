import { t } from './i18n.ts'
import type { Context } from '@deepseek-ai/cordis'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { SessionBinding } from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-api-session-controller/client'
import type {} from '@deepseek-ai/dsh-client-ui-conversation/client'

/** Plain Markdown, including a blank paragraph after the quoted passage. */
export function markdownQuote(passage: string): string {
  const text = passage.trim()
  if (text === '') throw new Error(t('settings.error.selectQuote'))
  return `${text.split(/\r\n?|\n/).map(line => line === '' ? '>' : `> ${line}`).join('\n')}\n\n`
}

/**
 * The draft text after adding a quote, for hosts that cannot append themselves. Rewriting the
 * text is only safe while the composer holds no reference chips: its draft text shows chips in
 * their clipboard form, and writing that text back turns them into plain text.
 * @param chips - reference chips in the composer (`occurrences`), counted by the host.
 * @returns the next draft text, or null when the composer holds reference chips.
 */
export function appendedDraft(draft: string, quote: string, chips: number): string | null {
  if (chips > 0) return null
  const kept = draft.replace(/\s+$/u, '')
  return kept === '' ? quote : `${kept}\n\n${quote}`
}

/** Where the quote went: into the main composer, or onto the clipboard to paste there. */
export type MainQuoteOutcome = 'inserted' | 'copied'

/** Add a quote to the still-current main Session's native composer; never submit it. */
export async function appendMainQuote(ctx: Context, sessionId: SessionId, passage: string): Promise<MainQuoteOutcome> {
  const binding = ctx.sessions.binding(sessionId)
  const scope = ctx.sessions.scope(sessionId)
  if (binding === undefined || scope === undefined || ctx.uiSession.adapter.current.getSnapshot().key !== sessionId) {
    throw new Error(t('settings.error.sourceChanged'))
  }
  const quote = markdownQuote(passage)
  const input = ctx.conversation.input
  // DSH 0.2.1-rc.3 appends to an existing draft; earlier hosts keep an existing draft unchanged ('preserved').
  const resolver = input as typeof input & {
    requestDraftInitialization?: (target: SessionBinding, options: { prompt: string, whenDraftExists: 'append' }) => 'applied' | 'preserved' | 'blocked'
  }
  const composer = input.for(scope)
  const outcome = resolver.requestDraftInitialization?.(binding, { prompt: quote, whenDraftExists: 'append' }) ?? 'preserved'
  if (outcome === 'blocked') throw new Error(t('settings.error.mainSubmitting'))
  if (outcome === 'preserved') {
    const state = composer.state.getSnapshot() as { readonly draft: string, readonly occurrences?: readonly unknown[] }
    // Without the chip list we cannot prove the rewrite is lossless, so treat it as holding chips.
    const next = appendedDraft(state.draft, quote, state.occurrences?.length ?? 1)
    if (next === null) {
      await navigator.clipboard.writeText(quote)
      composer.notify('info', t('settings.status.quoteCopied'))
      composer.focus()
      return 'copied'
    }
    composer.setDraft(next)
  }
  composer.focus()
  return 'inserted'
}
