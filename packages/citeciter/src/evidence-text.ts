/** Shared tool-evidence text projections used by Host validation and Client claims. */

/** Tool-result projection kinds carried by a tool EvidenceRef. */
export type ToolEvidenceProjection = 'result-text' | 'terminal' | 'diff'

/** One diff entry inside the opaque `tool/result.meta` written by dsh-tool-fs. */
export interface FileDiffMetaEntry {
  readonly path: string
  readonly oldText: string | null
  readonly newText: string
}

/**
 * Join the text blocks of one tool result into its citable projection.
 * @param blocks - model-facing tool-result content blocks.
 * @returns concatenated text blocks.
 */
export function projectToolResultText(blocks: readonly unknown[]): string {
  let text = ''
  for (const block of blocks) {
    if (block === null || typeof block !== 'object') continue
    const candidate = block as { readonly type?: unknown, readonly text?: unknown }
    if (candidate.type === 'text' && typeof candidate.text === 'string') text += candidate.text
  }
  return text
}

/**
 * Project one diff payload from a tool-result presentation meta.
 * @param meta - opaque tool-result meta carrying an optional `diffs` array.
 * @returns deterministic whole-card diff text, or null when no valid diff exists.
 */
export function projectDiffMeta(meta: unknown): string | null {
  if (meta === null || typeof meta !== 'object') return null
  const candidate = meta as { readonly diffs?: unknown }
  if (!Array.isArray(candidate.diffs) || candidate.diffs.length === 0) return null
  const sections: string[] = []
  for (const entry of candidate.diffs) {
    if (entry === null || typeof entry !== 'object') return null
    const diff = entry as { readonly path?: unknown, readonly oldText?: unknown, readonly newText?: unknown }
    if (typeof diff.path !== 'string' || diff.path === '' || typeof diff.newText !== 'string') return null
    if (diff.oldText !== null && typeof diff.oldText !== 'string') return null
    sections.push(
      `--- ${diff.path} (old) ---\n${diff.oldText ?? ''}\n+++ ${diff.path} (new) ---\n${diff.newText}`,
    )
  }
  return sections.join('\n\n')
}

/** Whitespace-collapsed text without per-line number gutters such as `12: ` or `12 | `. */
function comparableText(text: string): string {
  return text.replace(/^[ \t]*\d+(?::|\s*\|)[ \t]?/gmu, '').replace(/\s+/gu, ' ').trim()
}

/**
 * Whether a quote the user selected inside a tool card is part of the tool result. Rendered cards
 * add line-number gutters and reflow whitespace, so both sides are compared without them.
 * @param sourceText - the committed whole-card projection.
 * @param quote - the selected text.
 * @returns true for the whole projection or a non-empty part of it.
 */
export function toolExcerptMatches(sourceText: string, quote: string): boolean {
  if (quote.trim() === sourceText.trim()) return true
  const part = comparableText(quote)
  return part !== '' && comparableText(sourceText).includes(part)
}

/**
 * Resolve the citable whole-card projection for one tool result.
 * @param projection - declared evidence projection kind.
 * @param content - model-facing tool-result content blocks.
 * @param meta - opaque presentation meta (diff payload for the diff projection).
 * @returns projection text, or null when the payload cannot satisfy the kind.
 */
export function projectToolEvidence(
  projection: ToolEvidenceProjection,
  content: readonly unknown[],
  meta: unknown,
): string | null {
  if (projection === 'diff') return projectDiffMeta(meta)
  return projectToolResultText(content)
}
