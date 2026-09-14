import { IconArchiveOutline20, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './TopicSettingsDialog.module.css'

/**
 * Render infrequent Topic management separately from the learning composer.
 * @param props - current identity, operation status and management callbacks.
 * @returns a controlled dialog; deletion is enabled only for legacy private logs or verified Citer-owned source storage.
 */
export function TopicSettingsDialog({ open, topic, archiving, deleting, error, onClose, onArchive, onDelete }: {
  readonly open: boolean
  readonly topic: { readonly sessionId: string, readonly title: string, readonly archived: boolean, readonly hosted?: boolean | undefined, readonly storage?: 'source' | undefined } | undefined
  readonly archiving: boolean
  readonly deleting: boolean
  readonly error: string | null
  readonly onClose: () => void
  readonly onArchive: (archived: boolean) => Promise<boolean>
  readonly onDelete: () => void
}) {
  return <Modal open={open && topic !== undefined} onClose={onClose} closeLabel="关闭" title="Topic 设置">
    {topic !== undefined && <div className={css.settings}>
      <div className={css.actions}>
        <button type="button" aria-label={topic.archived ? '恢复当前 Topic' : '归档当前 Topic'} disabled={archiving}
          onClick={() => { void onArchive(!topic.archived).then(saved => { if (saved) onClose() }) }}>
          <IconArchiveOutline20 size={16} />{archiving ? '处理中…' : topic.archived ? '恢复' : '归档'}
        </button>
        <button type="button" className={css.danger} disabled={deleting || topic.hosted === true && topic.storage !== 'source'} onClick={onDelete}
          title={topic.hosted === true && topic.storage !== 'source' ? '重启 DSH 后迁移至 Citer 自有目录' : undefined}>永久删除</button>
      </div>
      {topic.hosted === true && topic.storage !== 'source' && <p className={css.hint}>此 Topic 尚未迁移，目前可归档与恢复。</p>}
      {error !== null && <p role="alert" className={css.error}>{error}</p>}
    </div>}
  </Modal>
}
