import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { SettingsSectionOwnerProps } from '@deepseek-ai/dsh-client-ui-settings/client'
import type { CompanionFace } from '../companion-controller.ts'
import mascotUrl from '../assets/citeciter-mascot.png'
import css from './CiteCiter.module.css'

export interface CiteCiterSettingsProps extends SettingsSectionOwnerProps {
  readonly companion: CompanionFace
}

/** Native DSH settings page for CiteCiter-owned preferences. */
export function CiteCiterSettings({ companion }: CiteCiterSettingsProps) {
  const snapshot = useSyncExternalStore(companion.subscribe, companion.getSnapshot)
  const settings = snapshot.settings
  const [widthDraft, setWidthDraft] = useState(settings.panelWidthPercent)
  const committedWidth = useRef(settings.panelWidthPercent)
  useEffect(() => {
    committedWidth.current = settings.panelWidthPercent
    setWidthDraft(settings.panelWidthPercent)
  }, [settings.panelWidthPercent])
  const commitWidth = (value: number) => {
    if (value === committedWidth.current) return
    committedWidth.current = value
    void companion.setSetting('panelWidthPercent', value)
  }
  return (
    <div className={css.settingsPage}>
      <header className={css.settingsHero}>
        <span className={css.settingsWhale} aria-hidden="true"><img src={mascotUrl} alt="" /></span>
        <div>
          <h2>CiteCiter</h2>
          <p>保留 DSH 的编程主界面，把学习讨论放在右侧独立工作区。</p>
        </div>
      </header>
      {snapshot.settingsSaveMessage !== null && (
        <p
          className={css.settingsSaveStatus}
          data-status={snapshot.settingsSaveStatus}
          role={snapshot.settingsSaveStatus === 'error' ? 'alert' : 'status'}
        >{snapshot.settingsSaveMessage}</p>
      )}

      <section className={css.settingsGroup}>
        <h3>新 Topic 的来源方式</h3>
        <label className={css.settingChoice} data-selected={settings.defaultMode === 'observer' || undefined}>
          <input
            type="radio"
            name="citeciter-default-mode"
            checked={settings.defaultMode === 'observer'}
            onChange={() => { void companion.setSetting('defaultMode', 'observer') }}
          />
          <span><strong>Observer（推荐）</strong><small>模型调用一完成即可提问；主 Agent 后续的新调用仍可被只读查看。</small></span>
        </label>
        <label className={css.settingChoice} data-selected={settings.defaultMode === 'exact-when-available' || undefined}>
          <input
            type="radio"
            name="citeciter-default-mode"
            checked={settings.defaultMode === 'exact-when-available'}
            onChange={() => { void companion.setSetting('defaultMode', 'exact-when-available') }}
          />
          <span><strong>可用时精确分叉</strong><small>轮次已结束时冻结完整前缀；开放轮次自动回到 Observer。</small></span>
        </label>
      </section>

      <section className={css.settingsGroup}>
        <h3>来源读取</h3>
        <label className={css.settingToggle}>
          <span><strong>包含来源 reasoning</strong><small>关闭后 read_source_session 不向 CiteCiter 返回主 Agent 的思考正文。</small></span>
          <input
            type="checkbox"
            checked={settings.includeSourceReasoning}
            onChange={(event) => { void companion.setSetting('includeSourceReasoning', event.currentTarget.checked) }}
          />
        </label>
        <label className={css.settingToggle}>
          <span><strong>允许调查来源工作区</strong><small>提供 DSH 标准 read、glob 与 grep；写入、编辑、任意命令与外部副作用始终不可用。</small></span>
          <input
            type="checkbox"
            checked={settings.allowSourceFiles}
            onChange={(event) => { void companion.setSetting('allowSourceFiles', event.currentTarget.checked) }}
          />
        </label>
      </section>

      <section className={css.settingsGroup}>
        <h3>学习栏</h3>
        <label className={css.widthSetting}>
          <span><strong>默认宽度</strong><output>{widthDraft}%</output></span>
          <input
            type="range"
            min={28}
            max={55}
            step={1}
            value={widthDraft}
            onChange={(event) => setWidthDraft(Number(event.currentTarget.value))}
            onPointerUp={(event) => commitWidth(Number(event.currentTarget.value))}
            onBlur={(event) => commitWidth(Number(event.currentTarget.value))}
            onKeyUp={(event) => {
              if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                commitWidth(Number(event.currentTarget.value))
              }
            }}
          />
        </label>
        <label className={css.settingToggle}>
          <span><strong>重新打开上次 Topic</strong><small>刷新或重新进入来源 Session 时，自动展开学习栏并恢复最近讨论。</small></span>
          <input
            type="checkbox"
            checked={settings.reopenLastTopic}
            onChange={(event) => { void companion.setSetting('reopenLastTopic', event.currentTarget.checked) }}
          />
        </label>
        <div className={css.dockPreview} aria-label="学习栏宽度预览">
          <span className={css.previewSidebar} />
          <span className={css.previewCoding}>DSH 编程对话</span>
          <span className={css.previewDock} style={{ width: widthDraft + '%' }}>CiteCiter</span>
        </div>
      </section>
    </div>
  )
}
