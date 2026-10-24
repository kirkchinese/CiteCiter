/**
 * Citer's interface text through DSH's locale service. The `citeciter` namespace carries the
 * built-in Chinese and English dictionaries; language packs from other plugins may register more
 * locales for it, and DSH's fallback chain applies. Text follows DSH's language setting live.
 *
 * Components call {@link useLocale} once so they re-render on a language switch, then read text
 * with {@link t}; controllers call {@link t} when they produce a message.
 */
import { useSyncExternalStore } from 'react'
import type { Context } from '@deepseek-ai/cordis'
import { en, zh, type CiterKey } from './locales/index.ts'

export type { CiterKey } from './locales/index.ts'

/** DSH locale namespace that holds Citer's dictionaries. */
export const CITER_LOCALE_NAMESPACE = 'citeciter'

/** The slice of DSH's `locale` service Citer uses; its package is not a Citer dependency. */
interface LocaleService {
  getLocale(): { readonly active: string }
  subscribe(listener: () => void): () => void
  register(namespace: string, locale: string, dictionary: Readonly<Record<string, string>>): () => void
  bind(namespace: string): (key: string, params?: Record<string, unknown>) => string
}

let translate: ((key: string, params?: Record<string, unknown>) => string) | undefined
let activeLocale = 'zh'
let revision = 0
const listeners = new Set<() => void>()

function notify(): void {
  revision += 1
  for (const listener of listeners) listener()
}

/** Fill `{name}` placeholders, as DSH's own dictionaries do. */
export function formatText(template: string, params?: Record<string, unknown>): string {
  if (params === undefined) return template
  return template.replace(/\{(\w+)\}/gu, (whole, name: string) => name in params ? String(params[name]) : whole)
}

/**
 * Translate one Citer key in the active DSH language.
 * @param key - dictionary key.
 * @param params - `{name}` placeholder values.
 */
export function t(key: CiterKey, params?: Record<string, unknown>): string {
  if (translate !== undefined) return translate(key, params)
  return formatText(zh[key], params)
}

/** Whether DSH currently shows Chinese; picks localized defaults such as preset action prompts. */
export function isChinese(): boolean {
  return activeLocale === 'zh' || activeLocale.startsWith('zh-')
}

/** Re-render on DSH language changes; returns a revision usable as a memo dependency. */
export function useLocale(): number {
  return useSyncExternalStore(subscribeLocale, readRevision, readRevision)
}

function subscribeLocale(listener: () => void): () => void {
  listeners.add(listener)
  return () => { listeners.delete(listener) }
}

function readRevision(): number {
  return revision
}

/**
 * Register Citer's dictionaries and follow the active language for the lifetime of `ctx`.
 * Without DSH's locale service, text stays Chinese.
 * @param ctx - Client root context.
 */
export function installLocale(ctx: Context): void {
  ctx.inject(['locale'], (localeCtx) => {
    const locale = (localeCtx as unknown as { readonly locale: LocaleService }).locale
    localeCtx.effect(() => locale.register(CITER_LOCALE_NAMESPACE, 'zh', zh), 'citeciter: Chinese dictionary')
    localeCtx.effect(() => locale.register(CITER_LOCALE_NAMESPACE, 'en', en), 'citeciter: English dictionary')
    translate = locale.bind(CITER_LOCALE_NAMESPACE)
    activeLocale = locale.getLocale().active
    notify()
    localeCtx.effect(() => locale.subscribe(() => {
      activeLocale = locale.getLocale().active
      notify()
    }), 'citeciter: locale changes')
    localeCtx.effect(() => () => {
      translate = undefined
      activeLocale = 'zh'
      notify()
    }, 'citeciter: locale binding')
  })
}
