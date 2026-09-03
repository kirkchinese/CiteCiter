import { useEffect, useId, useRef, useSyncExternalStore } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import { citeCiterUpdateCommand, type UpdateController } from '../update-controller.ts'
import css from './UpdateNotice.module.css'

/** Injected owner of the root-scoped update state. */
export interface UpdateNoticeProps {
  readonly updateController: UpdateController
}

/**
 * Render the non-modal Web update notice in the frame-wide overlay.
 * @param props - root-scoped update actions and observable state.
 * @returns the available-version card, or no surface while current or suppressed.
 */
export function UpdateNotice({ updateController }: UpdateNoticeProps) {
  const snapshot = useSyncExternalStore(updateController.subscribe, updateController.getSnapshot)
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
        CiteCiter 有新版本 {available.latestVersion}
      </p>
      <div className={css.heading}>
        <span className={css.badge} aria-hidden="true">↑</span>
        <div>
          <h2 id={titleId}>CiteCiter 有新版本</h2>
          <p className={css.version}>
            <span>v{available.currentVersion}</span>
            <span aria-hidden="true">→</span>
            <strong>v{available.latestVersion}</strong>
          </p>
        </div>
      </div>
      <p id={descriptionId} className={css.description}>
        “更新”只会复制官方安装命令，不会自动执行。自定义 Web Profile 请替换命令中的 web；执行前请核对新版 DSH 要求，运行后请重启 DSH Web。
      </p>
      <code className={css.command}>{citeCiterUpdateCommand(available.latestVersion)}</code>
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
          aria-label="更新"
          disabled={busy}
          onClick={() => { void updateController.copyUpdateCommand() }}
        >更新</Button>
        <Button
          variant="outline"
          className={css.action}
          aria-label="下次一定"
          disabled={busy}
          onClick={() => {
            updateController.defer()
            restoreFocus()
          }}
        >下次一定</Button>
        <Button
          variant="ghost"
          className={css.action}
          aria-label="不再提示"
          disabled={busy}
          onClick={() => { void disableNotifications() }}
        >不再提示</Button>
      </div>
    </section>
  )
}
