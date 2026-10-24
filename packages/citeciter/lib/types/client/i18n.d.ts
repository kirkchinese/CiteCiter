import type { Context } from '@deepseek-ai/cordis';
import { type CiterKey } from './locales/index.ts';
export type { CiterKey } from './locales/index.ts';
/** DSH locale namespace that holds Citer's dictionaries. */
export declare const CITER_LOCALE_NAMESPACE = "citeciter";
/** Fill `{name}` placeholders, as DSH's own dictionaries do. */
export declare function formatText(template: string, params?: Record<string, unknown>): string;
/**
 * Translate one Citer key in the active DSH language.
 * @param key - dictionary key.
 * @param params - `{name}` placeholder values.
 */
export declare function t(key: CiterKey, params?: Record<string, unknown>): string;
/** Whether DSH currently shows Chinese; picks localized defaults such as preset action prompts. */
export declare function isChinese(): boolean;
/** Re-render on DSH language changes; returns a revision usable as a memo dependency. */
export declare function useLocale(): number;
/**
 * Register Citer's dictionaries and follow the active language for the lifetime of `ctx`.
 * Without DSH's locale service, text stays Chinese.
 * @param ctx - Client root context.
 */
export declare function installLocale(ctx: Context): void;
