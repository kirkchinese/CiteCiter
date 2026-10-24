import { t, useLocale } from '../i18n.ts'
import css from './FileDropHint.module.css'

/** Display the receiving Topic without intercepting the drag's pointer target. */
export function FileDropHint({ enabled, title }: { readonly enabled: boolean, readonly title: string | undefined }) {
  useLocale()
  return <div className={css.hint} role="status" data-citeciter-file-drop data-disabled={!enabled || undefined}>
    <strong>{enabled ? t('panel.file.drop') : t('panel.file.selectTopic')}</strong>
    {enabled && title && <span>{title}</span>}
  </div>
}
