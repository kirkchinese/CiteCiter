import { useEffect, useState } from 'react'
import { IconArchiveOutline20, Modal } from '@deepseek-ai/dsh-client-ui-primitives'
import css from './TopicSettingsDialog.module.css'

/**
 * Render infrequent Topic management separately from the learning composer.
 * @param props - current identity, operation status and management callbacks.
 * @returns a controlled dialog; renaming keeps its draft until this Topic changes.
 */
export function TopicSettingsDialog({ open, topic, renaming, archiving, deleting, error, onClose, onRename, onArchive, onDelete }: {
  readonly open: boolean
  readonly topic: { readonly sessionId: string, readonly title: string, readonly archived: boolean } | undefined
  readonly renaming: boolean
  readonly archiving: boolean
  readonly deleting: boolean
  readonly error: string | null
  readonly onClose: () => void
  readonly onRename: (title: string) => Promise<boolean>
  readonly onArchive: (archived: boolean) => Promise<boolean>
  readonly onDelete: () => void
}) {
  const [title, setTitle] = useState(topic?.title ?? '')
  const [dirty, setDirty] = useState(false)
  useEffect(() => { setTitle(topic?.title ?? ''); setDirty(false) }, [topic?.sessionId])
  useEffect(() => { if (!dirty) setTitle(topic?.title ?? '') }, [topic?.title, dirty])
  return <Modal open={open && topic !== undefined} onClose={onClose} closeLabel="关闭" title="Topic 设置">
    {topic !== undefined && <div className={css.settings}>
      <form onSubmit={event => {
        event.preventDefault()
        if (title.trim() !== '' && dirty && !renaming) void onRename(title).then(saved => { if (saved) setDirty(false) })
      }}>
        <label>Topic 标题<input aria-label="Topic 标题" value={title} onChange={event => { setTitle(event.currentTarget.value); setDirty(true) }} /></label>
        <button type="submit" disabled={title.trim() === '' || !dirty || renaming}>{renaming ? '保存中…' : dirty ? '保存' : '已保存'}</button>
      </form>
      <div className={css.actions}>
        <button type="button" aria-label={topic.archived ? '恢复当前 Topic' : '归档当前 Topic'} disabled={archiving}
          onClick={() => { void onArchive(!topic.archived).then(saved => { if (saved) onClose() }) }}>
          <IconArchiveOutline20 size={16} />{archiving ? '处理中…' : topic.archived ? '恢复' : '归档'}
        </button>
        <button type="button" className={css.danger} disabled={deleting} onClick={onDelete}>永久删除</button>
      </div>
      {error !== null && <p role="alert" className={css.error}>{error}</p>}
    </div>}
  </Modal>
}
