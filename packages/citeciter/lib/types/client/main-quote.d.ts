/**
 * Quoting a passage of the main conversation into its own composer, as a DSH reference chip.
 *
 * Citer registers an `@` reference source with DSH's input triggers. The chip shows a short
 * preview in the composer; when the user sends, DSH asks the source to serialize the chip and the
 * main agent receives `<quote from="…">passage</quote>` in place of it: the exact passage and who
 * said it, nothing else. DSH 0.2.1-rc.2 and later also render that text as a chip in the sent
 * message (see `user-text-quote.ts`).
 */
import type { Context } from '@deepseek-ai/cordis';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Name of Citer's reference source; DSH routes chip serialization by it. */
export declare const QUOTE_SOURCE = "citeciter-quote";
/** Who said the quoted passage, in the main agent's own terms. */
export type QuoteOrigin = 'assistant' | 'user' | 'tool';
/** One quoted passage of the main conversation. */
export interface MainQuote {
    readonly from: QuoteOrigin;
    readonly text: string;
}
/** @returns the chip's reference id: the quote itself, so a restored draft still serializes it. */
export declare function encodeQuote(quote: MainQuote): string;
/** Read a chip's reference id field by field; drafts persist it across reloads and versions. */
export declare function decodeQuote(ref: string): MainQuote | undefined;
/** What the main agent receives for one chip. */
export declare function quoteModelText(quote: MainQuote): string;
/**
 * Find the next serialized quote at or after `from` in sent message text.
 * @returns its range and content, or undefined when there is none.
 */
export declare function findQuote(text: string, from: number): {
    readonly start: number;
    readonly end: number;
    readonly quote: MainQuote;
} | undefined;
/** One line of the passage, short enough for a chip. */
export declare function quotePreview(text: string): string;
/** Markdown blockquote, used when the chip is copied out of the composer. */
export declare function markdownQuote(passage: string): string;
/**
 * The composer's end in DSH's detect coordinates, where every chip counts as one character.
 * The draft text shows chips in their clipboard form, so their extra length is taken off.
 * @param draft - the composer's draft text (clipboard projection).
 * @param chips - reference chips with their clipboard lengths.
 * @param commandToken - the leading command chip's token while one is claimed.
 */
export declare function composerEnd(draft: string, chips: readonly {
    readonly length: number;
}[], commandToken?: string): number;
/**
 * Register Citer's quote source with DSH's input triggers for the lifetime of `ctx`.
 * @param ctx - Client root context.
 */
export declare function installQuoteSource(ctx: Context): void;
/**
 * Add a quote chip at the end of the still-current main Session's composer and focus it.
 * Never sends; the user's existing text and chips stay as they are.
 */
export declare function insertMainQuote(ctx: Context, sessionId: SessionId, quote: MainQuote): void;
