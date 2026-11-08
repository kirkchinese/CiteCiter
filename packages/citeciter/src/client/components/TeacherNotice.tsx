import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { TeacherSuggestion } from '../../topic.ts'
import type { TeacherActions } from '../view-actions.ts'
import { t, useLocale } from '../i18n.ts'
import css from './TeacherNotice.module.css'

/**
 * Teacher mode's offer: a point worth learning from the latest turn, with Explain and Dismiss.
 * `bubble` speaks from the pet while Citer is closed; `bar` sits at the top of an open Citer.
 */
export function TeacherNotice({ suggestion, actions, variant }: {
  readonly suggestion: TeacherSuggestion
  readonly actions: TeacherActions
  readonly variant: 'bubble' | 'bar'
}) {
  useLocale()
  return <section className={css.notice} data-variant={variant} role="status" aria-label={t('panel.teacher.label')}>
    <div className={css.text}>
      <span className={css.label}>{t('panel.teacher.label')}</span>
      <strong className={css.title}>{suggestion.title}</strong>
      <p className={css.point}>{suggestion.point}</p>
    </div>
    <div className={css.buttons}>
      <Button variant="primary" size="sm" onClick={() => actions.explain(suggestion)}>{t('panel.teacher.explain')}</Button>
      <Button variant="ghost" size="sm" onClick={actions.dismiss}>{t('panel.teacher.dismiss')}</Button>
    </div>
  </section>
}
