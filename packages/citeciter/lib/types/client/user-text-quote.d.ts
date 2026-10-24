import type { Context } from '@deepseek-ai/cordis';
/**
 * Register the quote rule and its renderer for the lifetime of `ctx`, when the host supports them.
 * @param ctx - Client root context.
 */
export declare function installQuoteRendering(ctx: Context): void;
