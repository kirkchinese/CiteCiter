import type { FormEvent, Ref } from 'react'
import { IconStopFill16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProviderOption, TopicModelConfig } from '../../topic.ts'
import type { CompanionPhase } from '../companion-controller.ts'
import { TopicModelControls } from './TopicModelControls.tsx'
import css from './TopicComposer.module.css'

/**
 * Render the Topic draft and its submission controls without accessing services.
 * @param props - controlled draft, model route, request state and user-action callbacks.
 * @returns one form; model changes and sending remain owned by the Topic controller.
 */
export function TopicComposer({ question, placeholder, route, providers, phase, canSend, routeSaving, folded, inputRef, onExpand, onQuestion, onSubmit, onStop, onModel, onReasoning }: {
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
  readonly onSubmit: (event: FormEvent) => void
  readonly onStop: () => void
  readonly onModel: (provider: string, model: string) => void
  readonly onReasoning: (effort: string | null) => void
}) {
  const running = phase === 'running'
  const stopping = phase === 'stopping'
  return <form className={css.composer} data-folded={folded || undefined} onSubmit={onSubmit}>
    {folded && <button type="button" className={css.expandButton} onClick={onExpand}>{question.trim() === '' ? '补充问题' : '编辑草稿'}</button>}
    <textarea hidden={folded} ref={inputRef} rows={2} maxLength={11_000}
      aria-label="继续向 CiteCiter 提问" value={question} disabled={route === undefined}
      onChange={event => onQuestion(event.currentTarget.value)} placeholder={placeholder}
      onKeyDown={event => {
        if (event.key === 'Enter' && (event.ctrlKey || event.metaKey) && !event.nativeEvent.isComposing) {
          event.preventDefault()
          event.currentTarget.form?.requestSubmit()
        }
      }}
    />
    <div className={css.composerActions}>
      {route !== undefined && <TopicModelControls providers={providers} route={route} saving={routeSaving} onModel={onModel} onReasoning={onReasoning} />}
      <button className={css.sendButton} type={running ? 'button' : 'submit'}
        disabled={stopping || !running && (!canSend || routeSaving)}
        title={running ? '停止回答' : '发送 · Ctrl / ⌘ + Enter'}
        aria-label={running ? '停止回答' : stopping ? '正在停止' : '发送'}
        onClick={running ? onStop : undefined}
      >
        {running || stopping ? <IconStopFill16 size={16} /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>}
      </button>
    </div>
  </form>
}
