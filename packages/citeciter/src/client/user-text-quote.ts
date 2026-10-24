/**
 * Draw sent quotes as chips in the main conversation. DSH 0.2.1-rc.2 added plugin rules for sent
 * user text (`uiConversation.userText`) and their renderers (`conversation.user.text.node`); older
 * hosts have neither and show the serialized `<quote>` text as it is. Both seams are reached
 * structurally so the plugin still compiles against the official Desktop's SDK.
 */
import type { ComponentType } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import { findQuote, type MainQuote } from './main-quote.ts'
import { QuoteReference } from './components/QuoteReference.tsx'

/** User-text node id, also the renderer's slot key. */
const QUOTE_NODE = 'citeciterQuote'

interface QuoteNode {
  readonly id: string
  readonly start: number
  readonly end: number
  readonly data: MainQuote
}

interface UserTextRegistry {
  register(rule: { readonly id: string, readonly order: number, match(text: string, from: number): QuoteNode | undefined }): () => void
}

interface NodeSlots {
  inject(name: string, factory: () => () => void): void
  register(options: { readonly name: string, readonly key: string, readonly priority: number }, component: ComponentType<never>): () => void
}

/**
 * Register the quote rule and its renderer for the lifetime of `ctx`, when the host supports them.
 * @param ctx - Client root context.
 */
export function installQuoteRendering(ctx: Context): void {
  const userText = (ctx.uiConversation as unknown as { readonly userText?: UserTextRegistry }).userText
  if (userText === undefined) return
  ctx.effect(() => userText.register({
    id: QUOTE_NODE,
    order: 20,
    match(text, from) {
      const found = findQuote(text, from)
      return found === undefined ? undefined : { id: QUOTE_NODE, start: found.start, end: found.end, data: { from: found.quote.from, text: found.quote.text } }
    },
  }), 'citeciter: sent quote rule')
  const slots = ctx.slots as unknown as NodeSlots
  slots.inject('conversation.user.text.node', () => slots.register({
    name: 'conversation.user.text.node',
    key: QUOTE_NODE,
    priority: 100,
  }, QuoteReference as ComponentType<never>))
}
