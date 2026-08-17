/**
 * CiteCiter browser plugin.
 *
 * Browser interaction path: assistant-text selection → right-click `Citer!`
 * menu (shell.overlay) → resizable right details panel → an isolated,
 * read-only forked explainer session.
 */
import type { Context } from '@deepseek-ai/cordis';
/** Cordis identity for the CiteCiter browser plugin. */
export declare const name = "@kirkchinese/dsh-citeciter";
/** Hard dependencies whose appearance activates the browser fiber. */
export declare const inject: string[];
/**
 * Register the selection listener, overlay entry, and details-panel lifecycle.
 * @param ctx - Cordis browser context with layout, slots, and sessions services.
 */
export declare function apply(ctx: Context): void;
