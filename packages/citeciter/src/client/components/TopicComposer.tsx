import { t, useLocale } from '../i18n.ts'
import { useRef, type FormEvent, type Ref, type ReactNode } from 'react'
import { IconStopFillMedium } from '../host-icons.ts'
import type { ProviderOption, TopicModelConfig } from '../../topic.ts'
import type { CompanionPhase } from '../companion-controller.ts'
import { TopicModelControls } from './TopicModelControls.tsx'
import { PermissionControl, type PermissionMode } from './PermissionControl.tsx'
import type { DeliveryMode } from '../native-composer.ts'
import css from './TopicComposer.module.css'

/**
 * Render the Topic draft and its submission controls without accessing services.
 * @param props - controlled draft, model route, request state and user-action callbacks.
 * @returns one form; model changes and sending remain owned by the Topic controller.
 */
export function TopicComposer({ question, placeholder, route, providers, phase, canSend, routeSaving, folded, inputRef, onExpand, onQuestion, onComposition, onSubmit, onStop, onModel, onReasoning, attachments, permission, onPermission, onFiles, delivery, onDelivery }: {
  readonly permission: PermissionMode
  readonly onPermission: (mode: PermissionMode) => void
  readonly onFiles: (files: readonly File[]) => void
  readonly delivery: DeliveryMode
  readonly onDelivery: (mode: DeliveryMode) => void
  readonly attachments?: ReactNode
  readonly question: string
  readonly placeholder: string
  readonly route: TopicModelConfig | undefined
  readonly providers: readonly ProviderOption[]
  readonly phase: CompanionPhase
  readonly canSend: boolean
  readonly routeSaving: boolean
  readonly folded: boolean
  readonly inputRef: Ref<HTMLTextAreaElement>
  readonly onExpand: () => void
  readonly onQuestion: (question: string) => void
  readonly onComposition: (composing: boolean) => void
  readonly onSubmit: (event: FormEvent, mode?: DeliveryMode) => void
  readonly onStop: () => void
  readonly onModel: (provider: string, model: string) => void
  readonly onReasoning: (effort: string | null) => void
}) {
  useLocale()
  const fileInput = useRef<HTMLInputElement>(null)
  const running = phase === 'running'
  const stopping = phase === 'stopping'
  return <form className={css.composer} data-folded={folded || undefined} onSubmit={onSubmit}>
    <input hidden ref={fileInput} type="file" multiple onChange={event => { onFiles([...(event.currentTarget.files ?? [])]); event.currentTarget.value = '' }} />
    {attachments}
    {folded && <button type="button" className={css.expandButton} onClick={onExpand}>{question.trim() === '' ? t('panel.composer.addQuestion') : t('panel.composer.editDraft')}</button>}
    <textarea hidden={folded} ref={inputRef} rows={2} maxLength={11_000}
      aria-label={t('panel.composer.ask')} value={question} disabled={route === undefined}
      onChange={event => onQuestion(event.currentTarget.value)} placeholder={placeholder}
      onCompositionStart={() => onComposition(true)} onCompositionEnd={() => onComposition(false)}
      onBlur={() => onComposition(false)}
      onPaste={event => {
        if (event.clipboardData.files.length === 0) return
        onFiles([...event.clipboardData.files])
        // Keep native textarea insertion when the clipboard also carries text.
        if (event.clipboardData.getData('text/plain') === '') event.preventDefault()
      }}
      onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
          event.preventDefault()
          if (running && (event.ctrlKey || event.metaKey)) onSubmit(event, delivery === 'queue' ? 'steer' : 'queue')
          else event.currentTarget.form?.requestSubmit()
        }
      }}
    />
    <div className={css.composerActions}>
      <button type="button" className={css.attachButton} aria-label={t('panel.composer.attach')} title={t('panel.composer.attach')} disabled={route === undefined} onClick={() => fileInput.current?.click()}>+</button>
      <PermissionControl value={permission} onChange={onPermission} />
      {route !== undefined && <TopicModelControls providers={providers} route={route} saving={routeSaving} onModel={onModel} onReasoning={onReasoning} />}
      {(running || stopping) && <button type="button" className={css.attachButton} aria-label={t('panel.composer.stop')} title={t('panel.composer.stop')} disabled={stopping} onClick={onStop}><IconStopFillMedium size={16} /></button>}
      {running && <button className={css.attachButton} type="button" title={delivery === 'queue' ? t('panel.composer.queueHint') : t('panel.composer.steerHint')} aria-label={delivery === 'queue' ? t('panel.composer.queueSend') : t('panel.composer.steerSend')} onClick={() => onDelivery(delivery === 'queue' ? 'steer' : 'queue')}>{delivery === 'queue' ? '☷' : '↗'}</button>}
      <button className={css.sendButton} type="submit" disabled={stopping || !canSend || routeSaving} title={running ? t('panel.composer.runningHint', { normal: delivery === 'queue' ? t('panel.composer.queue') : t('panel.composer.steer'), alternate: delivery === 'queue' ? t('panel.composer.steer') : t('panel.composer.queue') }) : t('panel.composer.sendHint')} aria-label={t('panel.composer.send')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  </form>
}
