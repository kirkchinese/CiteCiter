import * as primitives from '@deepseek-ai/dsh-client-ui-primitives'
import type { ComponentType } from 'react'

type Icon = ComponentType<{ size?: number; className?: string }>
/** DSH renamed size-specific icons in 0.1.7; the module-table import remains shared. */
function icon(modern: string, legacy: string): Icon {
  const exports = primitives as unknown as Record<string, Icon | undefined>
  const component = exports[modern] ?? exports[legacy]
  if (component === undefined) throw new Error(`DSH 缺少图标：${modern}`)
  return component
}
export const IconSettingsOutlineMedium = icon('IconSettingsOutlineMedium', 'IconSettingsOutline14')
export const IconQuestionOutlineMedium = icon('IconQuestionOutlineMedium', 'IconQuestionOutline14')
export const IconSparkleMedium = icon('IconSparkleMedium', 'IconSparkle16')
export const IconDownloadOutlineMedium = icon('IconDownloadOutlineMedium', 'IconDownloadOutline16')
export const IconThinkOutlineMedium = icon('IconThinkOutlineMedium', 'IconThinkOutline14')
export const IconStopFillMedium = icon('IconStopFillMedium', 'IconStopFill16')
export const IconArchiveOutlineMedium = icon('IconArchiveOutlineMedium', 'IconArchiveOutline20')
