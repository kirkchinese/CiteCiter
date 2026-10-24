import type { TopicUsage as TopicUsageValue } from '../../topic.ts'
import css from './TopicUsage.module.css'

function compactTokens(tokens: number): string {
  if (tokens < 1_000) return String(tokens)
  const unit = tokens < 1_000_000 ? 1_000 : 1_000_000
  const value = tokens / unit
  return `${value >= 100 ? Math.round(value) : Math.round(value * 10) / 10}${unit === 1_000 ? 'K' : 'M'}`
}

/** Present Topic-owned token totals without fetching state or mutating the panel. */
export function TopicUsage({ usage }: { readonly usage?: TopicUsageValue }) {
  if (usage === undefined) return null
  const total = usage.inputTokens + usage.outputTokens
  if (total === 0) return null
  const hitRate = usage.inputTokens > 0 ? usage.cachedInputTokens / usage.inputTokens * 100 : null
  const cache = hitRate === null ? null : `缓存命中 ${hitRate < 100 && Math.round(hitRate) === 100 ? Math.min(99.9, Math.round(hitRate * 10) / 10) : Math.round(hitRate)}%`
  const context = usage.lastContextTokens !== undefined && usage.contextWindow !== undefined
    ? `上下文 ${Math.min(100, Math.round(usage.lastContextTokens / usage.contextWindow * 100))}%`
    : null
  return <span className={css.usage} aria-label={[`用量 ${compactTokens(total)} tok`, cache, context].filter(Boolean).join(' · ')}>
    <span>用量 {compactTokens(total)} tok</span>
    {cache !== null && <><span className={css.separator} aria-hidden="true">·</span><span>{cache}</span></>}
    {context !== null && <><span className={css.separator} aria-hidden="true">·</span><span>{context}</span></>}
  </span>
}
