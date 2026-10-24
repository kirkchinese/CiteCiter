import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { UpdateNoticeSnapshot } from '../update-controller.ts'
import type { UpdateActions } from '../view-actions.ts'
import { useEffect, useId, useRef } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { citeCiterUpdateCommand } from '../update-controller.ts'
import { t, useLocale } from '../i18n.ts'
import css from './UpdateNotice.module.css'

/** Injected owner of the root-scoped update state. */
export interface UpdateNoticeProps {
  readonly useUpdate: SnapshotSelectorHook<UpdateNoticeSnapshot>
  readonly updateController: UpdateActions
}

/**
 * Render the non-modal Web update notice in the frame-wide overlay.
 * @param props - root-scoped update actions and observable state.
 * @returns the available-version card, or no surface while current or suppressed.
 */
export function UpdateNotice({ useUpdate, updateController }: UpdateNoticeProps) {
  useLocale()
  const snapshot = useUpdate(value => value)
  const titleId = useId()
  const descriptionId = useId()
  const previousFocus = useRef<HTMLElement | null>(null)
  const available = snapshot.available

  useEffect(() => {
    if (available === null) return
    const active = document.activeElement
    if (active instanceof HTMLElement && active.closest('[data-citeciter-update-notice]') === null) {
      previousFocus.current = active
    }
  }, [available])

  if (available === null) return null

  const busy = snapshot.copyStatus === 'copying' || snapshot.preferenceStatus === 'saving'
  const restoreFocus = () => {
    const target = previousFocus.current
    requestAnimationFrame(() => {
      if (target?.isConnected === true) target.focus()
    })
  }
  const rememberFocus = () => {
    const active = document.activeElement
    if (active instanceof HTMLElement && active.closest('[data-citeciter-update-notice]') === null) {
      previousFocus.current = active
    }
  }
  const disableNotifications = async () => {
    const hidden = await updateController.setNotificationsEnabled(false)
    if (hidden) restoreFocus()
  }

  return (
    <section
      className={css.notice}
      data-citeciter-update-notice
      role="region"
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      aria-busy={busy}
      onPointerDownCapture={rememberFocus}
      onFocusCapture={rememberFocus}
    >
      <p className={css.announcement} role="status" aria-live="polite">
        {t('settings.update.announcement', { version: available.latestVersion })}
      </p>
      <div className={css.heading}>
        <span className={css.badge} aria-hidden="true">↑</span>
        <div>
          <h2 id={titleId}>{t('settings.update.title')}</h2>
          <p className={css.version}>
            <span>v{available.currentVersion}</span>
            <span aria-hidden="true">→</span>
            <strong>v{available.latestVersion}</strong>
          </p>
        </div>
      </div>
      <p id={descriptionId} className={css.description}>
        {t('settings.update.description')}
      </p>
      <code className={css.command}>{citeCiterUpdateCommand(available.latestVersion, available.profile)}</code>
      {snapshot.copyMessage !== null && (
        <p
          className={css.feedback}
          data-status={snapshot.copyStatus}
          role={snapshot.copyStatus === 'error' ? 'alert' : 'status'}
        >{snapshot.copyMessage}</p>
      )}
      {snapshot.preferenceStatus === 'error' && snapshot.preferenceMessage !== null && (
        <p className={css.feedback} data-status="error" role="alert">{snapshot.preferenceMessage}</p>
      )}
      <div className={css.actions}>
        <Button
          variant="primary"
          className={`${css.action} ${css.updateAction}`}
          aria-label={t('settings.update.update')}
          disabled={busy}
          onClick={() => { void updateController.copyUpdateCommand() }}
        >{t('settings.update.update')}</Button>
        <Button
          variant="outline"
          className={css.action}
          aria-label={t('settings.update.later')}
          disabled={busy}
          onClick={() => {
            updateController.defer()
            restoreFocus()
          }}
        >{t('settings.update.later')}</Button>
        <Button
          variant="ghost"
          className={css.action}
          aria-label={t('settings.update.never')}
          disabled={busy}
          onClick={() => { void disableNotifications() }}
        >{t('settings.update.never')}</Button>
      </div>
    </section>
  )
}
