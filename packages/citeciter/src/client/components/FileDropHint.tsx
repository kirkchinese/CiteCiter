import css from './FileDropHint.module.css'

/** Display the receiving Topic without intercepting the drag's pointer target. */
export function FileDropHint({ enabled, title }: { readonly enabled: boolean, readonly title: string | undefined }) {
  return <div className={css.hint} role="status" data-citeciter-file-drop data-disabled={!enabled || undefined}>
    <strong>{enabled ? '松开，添加到 Citer' : '先选择一个 Topic'}</strong>
    {enabled && title && <span>{title}</span>}
  </div>
}
