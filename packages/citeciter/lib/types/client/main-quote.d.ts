import type { Context } from '@deepseek-ai/cordis';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
/** Plain Markdown, including a blank paragraph after the quoted passage. */
export declare function markdownQuote(passage: string): string;
/**
 * The draft text after adding a quote, for hosts that cannot append themselves. Rewriting the
 * text is only safe while it holds no reference chips, which a plain-text rewrite would drop.
 * @returns the next draft text, or null when the draft holds reference chips.
 */
export declare function appendedDraft(draft: string, quote: string): string | null;
/** Where the quote went: into the main composer, or onto the clipboard to paste there. */
export type MainQuoteOutcome = 'inserted' | 'copied';
/** Add a quote to the still-current main Session's native composer; never submit it. */
export declare function appendMainQuote(ctx: Context, sessionId: SessionId, passage: string): Promise<MainQuoteOutcome>;
