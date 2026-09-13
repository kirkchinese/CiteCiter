import { useRef, useState, type FormEvent, type Ref, type ReactNode } from 'react'
import { IconStopFill16 } from '@deepseek-ai/dsh-client-ui-primitives'
import type { ProviderOption, TopicModelConfig } from '../../topic.ts'
import type { CompanionPhase } from '../companion-controller.ts'
import { TopicModelControls } from './TopicModelControls.tsx'
import { PermissionControl, type PermissionMode } from './PermissionControl.tsx'
import type { DeliveryMode } from '../native-composer.ts'
import css from './TopicComposer.module.css'
import { ChoicePopover } from './ChoicePopover.tsx'
import type { DraftReference } from '../draft-references.ts'

/**
 * Render the Topic draft and its submission controls without accessing services.
 * @param props - controlled draft, model route, request state and user-action callbacks.
 * @returns one form; model changes and sending remain owned by the Topic controller.
 */
export function TopicComposer({ question, placeholder, route, providers, phase, canSend, routeSaving, folded, inputRef, onExpand, onQuestion, onSubmit, onStop, onModel, onReasoning, attachments, permission, onPermission, onFiles, delivery, onDelivery, sources, onReference }: {
  readonly sources: readonly DraftReference[]
  readonly onReference: (reference: DraftReference) => void
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
  readonly onSubmit: (event: FormEvent, mode?: DeliveryMode) => void
  readonly onStop: () => void
  readonly onModel: (provider: string, model: string) => void
  readonly onReasoning: (effort: string | null) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const attachButton = useRef<HTMLButtonElement>(null)
  const [attachOpen, setAttachOpen] = useState(false)
  const running = phase === 'running'
  const stopping = phase === 'stopping'
  return <form className={css.composer} data-folded={folded || undefined} onSubmit={onSubmit} onDragOver={event => { if (event.dataTransfer.types.includes('Files')) event.preventDefault() }} onDrop={event => { if (event.dataTransfer.files.length > 0) { event.preventDefault(); onFiles([...event.dataTransfer.files]) } }}>
    <input hidden ref={fileInput} type="file" multiple onChange={event => { onFiles([...(event.currentTarget.files ?? [])]); event.currentTarget.value = '' }} />
    {attachments}
    {folded && <button type="button" className={css.expandButton} onClick={onExpand}>{question.trim() === '' ? '补充问题' : '编辑草稿'}</button>}
    <textarea hidden={folded} ref={inputRef} rows={2} maxLength={11_000}
      aria-label="继续向 CiteCiter 提问" value={question} disabled={route === undefined}
      onChange={event => onQuestion(event.currentTarget.value)} placeholder={placeholder}
      onPaste={event => { if (event.clipboardData.files.length > 0) { event.preventDefault(); onFiles([...event.clipboardData.files]) } }}
      onKeyDown={event => {
        if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing && event.keyCode !== 229) {
          event.preventDefault()
          if (running && (event.ctrlKey || event.metaKey)) onSubmit(event, delivery === 'queue' ? 'steer' : 'queue')
          else event.currentTarget.form?.requestSubmit()
        }
      }}
    />
    <div className={css.composerActions}>
      <button ref={attachButton} type="button" className={css.attachButton} aria-label="添加附件" title="添加文件或来源引用" disabled={route === undefined} aria-expanded={attachOpen} onClick={() => setAttachOpen(!attachOpen)}>+</button>
      {attachOpen && <ChoicePopover anchor={attachButton} label="添加引用或文件" onClose={() => setAttachOpen(false)}>
        <button type="button" role="menuitem" onClick={() => { setAttachOpen(false); fileInput.current?.click() }}>图片或文件 <span>↗</span></button>
        {sources.map(reference => <button type="button" role="menuitem" key={reference.id} onClick={() => { setAttachOpen(false); onReference(reference) }}>{reference.label}<span>＋</span></button>)}
      </ChoicePopover>}
      <PermissionControl value={permission} onChange={onPermission} />
      {route !== undefined && <TopicModelControls providers={providers} route={route} saving={routeSaving} onModel={onModel} onReasoning={onReasoning} />}
      {(running || stopping) && <button type="button" className={css.attachButton} aria-label="停止回答" title="停止回答" disabled={stopping} onClick={onStop}><IconStopFill16 size={16} /></button>}
      {running && <button className={css.attachButton} type="button" title={delivery === 'queue' ? '当前：排队发送；点击切换为插话' : '当前：插话；点击切换为排队'} aria-label={delivery === 'queue' ? '排队发送' : '插话发送'} onClick={() => onDelivery(delivery === 'queue' ? 'steer' : 'queue')}>{delivery === 'queue' ? '☷' : '↗'}</button>}
      <button className={css.sendButton} type="submit" disabled={stopping || !canSend || routeSaving} title={running ? `Enter：${delivery === 'queue' ? '排队' : '插话'}；Ctrl + Enter：${delivery === 'queue' ? '插话' : '排队'}；Shift + Enter：换行` : '发送 · Enter（Shift + Enter 换行）'} aria-label="发送">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 20V4m-7 7 7-7 7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
    </div>
  </form>
}
