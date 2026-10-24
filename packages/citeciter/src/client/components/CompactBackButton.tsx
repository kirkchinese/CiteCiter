import { t, useLocale } from '../i18n.ts'
import css from './CompactBackButton.module.css'

/** Return from the compact Citer page without discarding its Topic or draft. */
export function CompactBackButton({ onBack }: { readonly onBack: () => void }) {
  useLocale()
  return <button className={css.back} type="button" onClick={onBack} aria-label={t('panel.back')}>
    <svg viewBox="0 0 20 20" width="20" height="20" fill="none" aria-hidden="true"><path d="m12 4-6 6 6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
  </button>
}
