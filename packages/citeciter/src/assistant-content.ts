/**
 * Project committed reasoning and answer blocks in renderer order.
 *
 * @param blocks - DSH assistant content blocks.
 * @returns reasoning and answer text separated by the renderer's paragraph break.
 */
export function projectCitableAssistantContent(blocks: readonly unknown[]): string {
  let text = ''
  for (const block of blocks) {
    if (block === null || typeof block !== 'object') continue
    const candidate = block as { readonly kind?: unknown, readonly type?: unknown, readonly text?: unknown }
    const kind = candidate.kind ?? candidate.type
    if (typeof candidate.text !== 'string' || candidate.text === '') continue
    if (kind === 'reasoning') text += `${candidate.text}\n\n`
    else if (kind === 'text') text += candidate.text
  }
  return text
}
