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
import { t, useLocale } from '../i18n.ts'
import css from './Settings.module.css'
import { ActionSettings } from './ActionSettings.tsx'
import type { CiteOverlaySnapshot } from '../types.ts'
import { parseAccelerator } from '../hotkeys.ts'

/** What the settings page needs; the host's settings and plugin pages each add their own owner props. */
export interface CiteCiterSettingsProps extends Partial<SettingsSectionOwnerProps> {
  readonly useCompanion: SnapshotSelectorHook<CompanionSnapshot>
  readonly useDocument: SnapshotSelectorHook<SettingsDocumentSnapshot>
  readonly useUpdate: SnapshotSelectorHook<UpdateNoticeSnapshot>
  readonly companion: CompanionActions
  readonly settingsDocument: SettingsDocumentActions
  readonly updateController: UpdateActions
  /** Where the workspace lives; the width setting applies only to Citer's own overlay. */
  readonly useOverlay?: SnapshotSelectorHook<CiteOverlaySnapshot> | undefined
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
  useLocale()
  if (props.view === 'summary') return <>{t('settings.summary')}</>
  return <CiteCiterSettings {...props} />
}

/** Native DSH settings page for Citer preferences. */
export function CiteCiterSettings({ useCompanion, useDocument, useUpdate, useOverlay, companion, settingsDocument, updateController }: CiteCiterSettingsProps) {
  useLocale()
  const host = useOverlay?.(value => value.host) ?? 'overlay'
  const sidebarAvailable = useOverlay?.(value => value.sidebarAvailable) ?? false
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
      setShortcutError(t('settings.panel.shortcutError'))
      return
    }
    setShortcutError(null)
    if (value === (settings.shortcutOpenPanel ?? '')) return
    void companion.setSetting('shortcutOpenPanel', value === '' ? undefined : value)
  }
  const toggle = <Key extends 'reopenLastTopic' | 'includeSourceReasoning' | 'followupQuestions' | 'activeRecall' | 'boardAnimations' | 'autoReadSource' | 'standalonePanel'>(key: Key, label: string, fallback: boolean) =>
    <Switch label={label} checked={settings[key] ?? fallback} disabled={saving} onChange={value => { void companion.setSetting(key, value) }} />
  return (
    <div className={css.page}>
      <header className={css.intro}>
        <img src={mascotUrl} alt="" aria-hidden="true" />
        <div>
          <h2>Citer</h2>
          <p>{t('settings.intro')}</p>
        </div>
      </header>
      {snapshot.settingsSaveMessage !== null && (
        <p className={css.status} data-status={snapshot.settingsSaveStatus === 'error' ? 'error' : undefined}
          role={snapshot.settingsSaveStatus === 'error' ? 'alert' : 'status'}>
          {/* Translated at render time, so a language switch also updates a message already shown. */}
          {snapshot.settingsSaveStatus === 'saved' ? t('panel.settings.saved') : snapshot.settingsSaveStatus === 'saving' ? t('panel.settings.saving') : snapshot.settingsSaveMessage}
        </p>
      )}

      <ActionSettings snapshot={snapshot} companion={companion} />

      <section className={css.group}>
        <h3>Topic</h3>
        <Row title={t('settings.topic.permission')} desc={t('settings.topic.permissionDesc')}>
          <PermissionControl value={settings.defaultPermission ?? 'read-only'} onChange={mode => { void companion.setSetting('defaultPermission', mode) }} />
        </Row>
        <Row title={t('settings.topic.reopen')} desc={t('settings.topic.reopenDesc')}>{toggle('reopenLastTopic', t('settings.topic.reopen'), true)}</Row>
        <Row title={t('settings.topic.reasoning')} desc={t('settings.topic.reasoningDesc')}>{toggle('includeSourceReasoning', t('settings.topic.reasoning'), true)}</Row>
        <Row title={t('settings.topic.followups')} desc={t('settings.topic.followupsDesc')}>{toggle('followupQuestions', t('settings.topic.followups'), true)}</Row>
        <Row title={t('settings.topic.autoRead')} desc={t('settings.topic.autoReadDesc')}>{toggle('autoReadSource', t('settings.topic.autoRead'), false)}</Row>
        <Row title={t('settings.topic.changes')} desc={t('settings.topic.changesDesc')}>
          <SegmentedControl<NonNullable<CiteCiterSettingsValue['workspaceChanges']>> id="citeciter-workspace-changes" label={t('settings.topic.changes')} value={settings.workspaceChanges ?? 'summary'} disabled={saving}
            options={[{ value: 'off', label: t('settings.topic.off') }, { value: 'summary', label: t('settings.topic.summary') }, { value: 'diff', label: t('settings.topic.diff') }]}
            onChange={value => { void companion.setSetting('workspaceChanges', value) }} />
        </Row>
      </section>

      <section className={css.group}>
        <h3>{t('settings.learning.title')}</h3>
        <Row title={t('settings.learning.recall')} desc={t('settings.learning.recallDesc')}>{toggle('activeRecall', t('settings.learning.recall'), false)}</Row>
        <Row title={t('settings.learning.animations')} desc={t('settings.learning.animationsDesc')}>{toggle('boardAnimations', t('settings.learning.animations'), true)}</Row>
        <div className={css.row} data-stack>
          <div className={css.rowText}><span className={css.title}>{t('settings.learning.tutor')}</span><span className={css.desc}>{t('settings.learning.tutorDesc')}</span></div>
          <textarea className={css.textarea} value={settings.tutorPrompt ?? ''} maxLength={4000} rows={4} aria-label={t('settings.learning.tutor')} placeholder={t('settings.learning.tutorPlaceholder')}
            onChange={(event) => { void companion.setSetting('tutorPrompt', event.currentTarget.value === '' ? undefined : event.currentTarget.value) }} />
        </div>
      </section>

      <section className={css.group}>
        <h3>{t('settings.panel.title')}</h3>
        {sidebarAvailable && <Row title={t('settings.panel.standalone')} desc={t('settings.panel.standaloneDesc')}>{toggle('standalonePanel', t('settings.panel.standalone'), false)}</Row>}
        {/* In DSH's right sidebar the sidebar owns Citer's width. */}
        {host !== 'tab' && <Row title={t('settings.panel.width')} desc={t('settings.panel.widthDesc')}>
          <input className={css.range} type="range" min={28} max={55} step={1} value={widthDraft} aria-label={t('settings.panel.widthAria')}
            onChange={(event) => setWidthDraft(Number(event.currentTarget.value))}
            onPointerUp={(event) => commitWidth(Number(event.currentTarget.value))}
            onBlur={(event) => commitWidth(Number(event.currentTarget.value))}
            onKeyUp={(event) => { if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) commitWidth(Number(event.currentTarget.value)) }} />
          <output className={css.value}>{widthDraft}%</output>
        </Row>}
        <Row title={t('settings.panel.shortcut')} desc={t('settings.panel.shortcutDesc')}>
          <div className={css.field}>
            <input className={css.text} type="text" value={shortcutDraft} maxLength={40} placeholder="Control+Shift+C" aria-label={t('settings.panel.shortcut')}
              aria-invalid={shortcutError !== null} aria-describedby={shortcutError === null ? undefined : 'citeciter-shortcut-error'}
              onChange={event => { setShortcutDraft(event.currentTarget.value); setShortcutError(null) }}
              onBlur={commitShortcut} onKeyDown={event => { if (event.key === 'Enter' && !event.nativeEvent.isComposing) event.currentTarget.blur() }} />
            {shortcutError !== null && <span id="citeciter-shortcut-error" className={css.status} data-status="error" role="alert">{shortcutError}</span>}
          </div>
        </Row>
      </section>

      <section className={css.group}>
        <h3>{t('settings.other.title')}</h3>
        <Row title={t('settings.other.update')} desc={updateSnapshot.preferencePersistence === 'browser' ? t('settings.other.updateBrowserDesc') : t('settings.other.updateDesc')}>
          <Switch label={t('settings.other.update')} checked={updateSnapshot.notificationsEnabled}
            disabled={!updateSnapshot.preferenceReady || updateSnapshot.preferenceStatus === 'saving'}
            onChange={value => { void updateController.setNotificationsEnabled(value) }} />
        </Row>
        {updateSnapshot.preferenceMessage !== null && <p className={css.status} data-status={updateSnapshot.preferenceStatus === 'error' ? 'error' : undefined} role={updateSnapshot.preferenceStatus === 'error' ? 'alert' : 'status'}>{updateSnapshot.preferenceMessage}</p>}
        <Row title={t('settings.other.config')} desc={t('settings.other.configDesc')}>
          <Button variant="outline" size="sm"
            disabled={['loading', 'missing', 'unavailable'].includes(documentSnapshot.status) || documentSnapshot.opening}
            aria-busy={documentSnapshot.opening || documentSnapshot.status === 'loading'}
            onClick={() => { void settingsDocument.open() }}>
            {documentSnapshot.opening ? t('settings.other.opening')
              : documentSnapshot.status === 'loading' ? t('settings.other.checking')
                : documentSnapshot.status === 'unavailable' ? t('settings.other.unsupported')
                  : documentSnapshot.status === 'missing' ? t('settings.other.missing')
                    : documentSnapshot.status === 'error' ? t('settings.other.reopen') : t('settings.other.open')}
          </Button>
        </Row>
        {(documentSnapshot.error !== null || documentSnapshot.message !== null) && (
          <p className={css.status} data-status={documentSnapshot.error === null ? 'success' : 'error'} role={documentSnapshot.error === null ? 'status' : 'alert'}>{documentSnapshot.error ?? documentSnapshot.message}</p>
        )}
      </section>
    </div>
  )
}
