/**
 * CiteCiter browser plugin.
 *
 * Milestone 0 (this file): package skeleton + minimum path —
 * assistant-text selection → right-click `Citer!` menu (shell.overlay) →
 * resizable right details panel showing the resolved selection.
 * The explainer session pipeline is deliberately not wired yet.
 */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "@deepseek-ai/dsh-citeciter";
export declare const inject: string[];
export declare function apply(ctx: Context): void;
