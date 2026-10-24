import { PermissionControl } from './PermissionControl.tsx'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { UpdateNoticeSnapshot } from '../update-controller.ts'
import type { SettingsDocumentSnapshot } from '../settings-document.ts'
import type { CompanionSnapshot } from '../companion-controller.ts'
import type { CompanionActions, UpdateActions, SettingsDocumentActions } from '../view-actions.ts'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Button, SegmentedControl, Switch } from '@deepseek-ai/dsh-client-ui-primitives'
import type { CiteCiterSettings as CiteCiterSettingsValue } from '../../topic.ts'
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
import mascotUrl from '../assets/citeciter-mascot.png'
import css from './Settings.module.css'
import { ActionSettings } from './ActionSettings.tsx'
import { parseAccelerator } from '../hotkeys.ts'

/** What the settings page needs; the host's settings and plugin pages each add their own owner props. */
export interface CiteCiterSettingsProps extends Partial<SettingsSectionOwnerProps> {
  readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>
  readonly useDocument: SnapshotSelectorHook<SettingsDocumentSnapshot>
  readonly useUpdate: SnapshotSelectorHook<UpdateNoticeSnapshot>
  readonly companion: CompanionActions
  readonly settingsDocument: SettingsDocumentActions
  readonly updateController: UpdateActions
}

/** One host-style settings row: title and description on the left, the control on the right. */
function Row({ title, desc, children }: { readonly title: string, readonly desc?: string, readonly children: ReactNode }) {
  return <div className={css.row}>
    <div className={css.rowText}><span className={css.title}>{title}</span>{desc !== undefined && <span className={css.desc}>{desc}</span>}</div>
    <div className={css.control}>{children}</div>
  </div>
}

/**
 * Citer's entry on DSH's plugin page: a one-line summary in the list, the full settings on its page.
 * @param view - `summary` for the bundle row, `page` for the bundle's own page.
 */
export function CiterPluginConfig(props: CiteCiterSettingsProps & { readonly view: 'summary' | 'page' }) {
  if (props.view === 'summary') return <>选文工具条、预设动作、新 Topic 的模型与权限</>
  return <CiteCiterSettings {...props} />
}

/** Native DSH settings page for Citer preferences. */
export function CiteCiterSettings({ useCompanion, useDocument, useUpdate, companion, settingsDocument, updateController }: CiteCiterSettingsProps) {
  const snapshot = useCompanion(value => value)
  const documentSnapshot = useDocument(value => value)
  const updateSnapshot = useUpdate(value => value)
  const settings = snapshot.settings
  const saving = snapshot.settingsSaveStatus === 'saving'
  useEffect(() => companion.retainVisible(), [companion])
  const [widthDraft, setWidthDraft] = useState(settings.panelWidthPercent)
  const [shortcutDraft, setShortcutDraft] = useState(settings.shortcutOpenPanel ?? '')
  const [shortcutError, setShortcutError] = useState<string | null>(null)
  const committedWidth = useRef(settings.panelWidthPercent)
  useEffect(() => { setShortcutDraft(settings.shortcutOpenPanel ?? ''); setShortcutError(null) }, [settings.shortcutOpenPanel])
  useEffect(() => { void settingsDocument.load() }, [settingsDocument])
  useEffect(() => {
    committedWidth.current = settings.panelWidthPercent
    setWidthDraft(settings.panelWidthPercent)
  }, [settings.panelWidthPercent])
  const commitWidth = (value: number) => {
    if (value === committedWidth.current) return
    committedWidth.current = value
    void companion.setSetting('panelWidthPercent', value)
  }
  const commitShortcut = () => {
    const value = shortcutDraft.trim()
    if (value !== '' && parseAccelerator(value) === null) {
      setShortcutError('快捷键格式无效；请使用 Control+Shift+C 这样的组合，或留空禁用。')
      return
    }
    setShortcutError(null)
    if (value === (settings.shortcutOpenPanel ?? '')) return
    void companion.setSetting('shortcutOpenPanel', value === '' ? undefined : value)
  }
  const toggle = <Key extends 'reopenLastTopic' | 'includeSourceReasoning' | 'followupQuestions' | 'activeRecall' | 'boardAnimations' | 'autoReadSource'>(key: Key, label: string, fallback: boolean) =>
    <Switch label={label} checked={settings[key] ?? fallback} disabled={saving} onChange={value => { void companion.setSetting(key, value) }} />
  return (
    <div className={css.page}>
      <header className={css.intro}>
        <img src={mascotUrl} alt="" aria-hidden="true" />
        <div>
          <h2>Citer</h2>
          <p>选中 Agent 工作中的内容，在独立的 Topic 里追问，不改动主对话。</p>
        </div>
      </header>
      {snapshot.settingsSaveMessage !== null && (
        <p className={css.status} data-status={snapshot.settingsSaveStatus === 'error' ? 'error' : undefined}
          role={snapshot.settingsSaveStatus === 'error' ? 'alert' : 'status'}>{snapshot.settingsSaveMessage}</p>
      )}

      <ActionSettings snapshot={snapshot} companion={companion} />

      <section className={css.group}>
        <h3>Topic</h3>
        <Row title="新 Topic 的权限" desc="只影响之后新建的 Topic；DSH 的审批和沙箱照常生效。">
          <PermissionControl value={settings.defaultPermission ?? 'read-only'} onChange={mode => { void companion.setSetting('defaultPermission', mode) }} />
        </Row>
        <Row title="重新打开上次的 Topic" desc="回到来源对话时自动展开 Citer 并恢复最近的 Topic。">{toggle('reopenLastTopic', '重新打开上次的 Topic', true)}</Row>
        <Row title="读取来源时包含思考过程" desc="关闭后，Citer 读取来源对话时看不到主 Agent 的思考内容。">{toggle('includeSourceReasoning', '读取来源时包含思考过程', true)}</Row>
        <Row title="首个回答附带追问建议" desc="在第一个回答末尾给出三个可以接着问的问题。">{toggle('followupQuestions', '首个回答附带追问建议', true)}</Row>
        <Row title="自动附上来源摘录" desc="来源附件发送后，每轮开头附上来源对话最近的新内容。关闭时由 Citer 按需调用工具读取。">{toggle('autoReadSource', '自动附上来源摘录', false)}</Row>
        <Row title="代码库变化感知" desc="每轮开头告诉 Citer 上一轮以来 git 工作区改了哪些文件。“附带 diff”会直接附上逐行改动；“仅清单”只列文件，Citer 需要时再用工具读取。">
          <SegmentedControl<NonNullable<CiteCiterSettingsValue['workspaceChanges']>> id="citeciter-workspace-changes" label="代码库变化感知" value={settings.workspaceChanges ?? 'summary'} disabled={saving}
            options={[{ value: 'off', label: '关闭' }, { value: 'summary', label: '仅清单' }, { value: 'diff', label: '附带 diff' }]}
            onChange={value => { void companion.setSetting('workspaceChanges', value) }} />
        </Row>
      </section>

      <section className={css.group}>
        <h3>学习</h3>
        <Row title="主动回忆" desc="学习卡先显示自测问题，点开才看到结论和答案。">{toggle('activeRecall', '主动回忆', false)}</Row>
        <Row title="板书动画" desc="关闭后板书直接显示最终状态。">{toggle('boardAnimations', '板书动画', true)}</Row>
        <div className={css.row} data-stack>
          <div className={css.rowText}><span className={css.title}>导师提示词</span><span className={css.desc}>补充你的讲解偏好，下次发送起生效；留空使用内置提示词。</span></div>
          <textarea className={css.textarea} value={settings.tutorPrompt ?? ''} maxLength={4000} rows={4} aria-label="导师提示词" placeholder="例如：先给结论，再用一个小例子说明。"
            onChange={(event) => { void companion.setSetting('tutorPrompt', event.currentTarget.value === '' ? undefined : event.currentTarget.value) }} />
        </div>
      </section>

      <section className={css.group}>
        <h3>面板</h3>
        <Row title="默认宽度" desc="也可以拖动面板左边缘调整。">
          <input className={css.range} type="range" min={28} max={55} step={1} value={widthDraft} aria-label="面板默认宽度"
            onChange={(event) => setWidthDraft(Number(event.currentTarget.value))}
            onPointerUp={(event) => commitWidth(Number(event.currentTarget.value))}
            onBlur={(event) => commitWidth(Number(event.currentTarget.value))}
            onKeyUp={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) commitWidth(Number(event.currentTarget.value)) }} />
          <output className={css.value}>{widthDraft}%</output>
        </Row>
        <Row title="打开 Citer 的快捷键" desc="例如 Control+Shift+C；留空表示不使用。输入框里的按键不会被拦截。">
          <div className={css.field}>
            <input className={css.text} type="text" value={shortcutDraft} maxLength={40} placeholder="Control+Shift+C" aria-label="打开 Citer 的快捷键"
              aria-invalid={shortcutError !== null} aria-describedby={shortcutError === null ? undefined : 'citeciter-shortcut-error'}
              onChange={event => { setShortcutDraft(event.currentTarget.value); setShortcutError(null) }}
              onBlur={commitShortcut} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.currentTarget.blur() }} />
            {shortcutError !== null && <span id="citeciter-shortcut-error" className={css.status} data-status="error" role="alert">{shortcutError}</span>}
          </div>
        </Row>
      </section>

      <section className={css.group}>
        <h3>其他</h3>
        <Row title="版本更新提醒" desc={updateSnapshot.preferencePersistence === 'browser' ? '远程 Web 只在当前浏览器保存这个选择。' : '有新版本时提醒你。'}>
          <Switch label="版本更新提醒" checked={updateSnapshot.notificationsEnabled}
            disabled={!updateSnapshot.preferenceReady || updateSnapshot.preferenceStatus === 'saving'}
            onChange={value => { void updateController.setNotificationsEnabled(value) }} />
        </Row>
        {updateSnapshot.preferenceMessage !== null && <p className={css.status} data-status={updateSnapshot.preferenceStatus === 'error' ? 'error' : undefined} role={updateSnapshot.preferenceStatus === 'error' ? 'alert' : 'status'}>{updateSnapshot.preferenceMessage}</p>}
        <Row title="配置文件" desc="直接编辑 Citer 的全部设置。">
          <Button variant="outline" size="sm"
            disabled={['loading', 'missing', 'unavailable'].includes(documentSnapshot.status) || documentSnapshot.opening}
            aria-busy={documentSnapshot.opening || documentSnapshot.status === 'loading'}
            onClick={() => { void settingsDocument.open() }}>
            {documentSnapshot.opening ? '正在打开…'
              : documentSnapshot.status === 'loading' ? '正在检查…'
                : documentSnapshot.status === 'unavailable' ? '宿主不支持打开'
                  : documentSnapshot.status === 'missing' ? '配置文件不存在'
                    : documentSnapshot.status === 'error' ? '重新打开' : '打开配置文件'}
          </Button>
        </Row>
        {(documentSnapshot.error !== null || documentSnapshot.message !== null) && (
          <p className={css.status} data-status={documentSnapshot.error === null ? 'success' : 'error'} role={documentSnapshot.error === null ? 'status' : 'alert'}>{documentSnapshot.error ?? documentSnapshot.message}</p>
        )}
      </section>
    </div>
  )
}
