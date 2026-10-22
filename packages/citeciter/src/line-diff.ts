/** A small, bounded line diff for rendering edit payloads that carry old and new text. */

/** Largest LCS table, in cells, computed for the region between the common prefix and suffix. */
const DEFAULT_MAX_CELLS = 4_000_000

interface DiffLine { readonly op: ' ' | '-' | '+'; readonly text: string; readonly oldLine: number; readonly newLine: number }

function lines(text: string): string[] {
  if (text === '') return []
  const parts = text.split(/\r?\n/u)
  if (parts.at(-1) === '') parts.pop()
  return parts
}

function middleOps(a: readonly string[], b: readonly string[]): Array<' ' | '-' | '+'> {
  const n = a.length
  const m = b.length
  // Suffix LCS lengths, one row per old line.
  const table = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1))
  for (let i = n - 1; i >= 0; i -= 1) {
    const row = table[i]!
    const below = table[i + 1]!
    for (let j = m - 1; j >= 0; j -= 1) row[j] = a[i] === b[j] ? below[j + 1]! + 1 : Math.max(below[j]!, row[j + 1]!)
  }
  const ops: Array<' ' | '-' | '+'> = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (a[i] === b[j]) { ops.push(' '); i += 1; j += 1 }
    else if (table[i + 1]![j]! >= table[i]![j + 1]!) { ops.push('-'); i += 1 }
    else { ops.push('+'); j += 1 }
  }
  while (i < n) { ops.push('-'); i += 1 }
  while (j < m) { ops.push('+'); j += 1 }
  return ops
}

/**
 * Render a unified-style line diff (hunks only, no file headers).
 * @param oldText - previous text.
 * @param newText - replacement text.
 * @param options - context lines around changes and the LCS size limit.
 * @returns hunks text, an empty string when both texts have identical lines, or null when the changed region exceeds the limit.
 */
export function unifiedLineDiff(oldText: string, newText: string, options: { readonly context?: number, readonly maxCells?: number } = {}): string | null {
  const context = options.context ?? 2
  const a = lines(oldText)
  const b = lines(newText)
  let prefix = 0
  while (prefix < a.length && prefix < b.length && a[prefix] === b[prefix]) prefix += 1
  let suffix = 0
  while (suffix < a.length - prefix && suffix < b.length - prefix && a[a.length - 1 - suffix] === b[b.length - 1 - suffix]) suffix += 1
  const midA = a.slice(prefix, a.length - suffix)
  const midB = b.slice(prefix, b.length - suffix)
  if (midA.length === 0 && midB.length === 0) return ''
  if ((midA.length + 1) * (midB.length + 1) > (options.maxCells ?? DEFAULT_MAX_CELLS)) return null
  const all: DiffLine[] = []
  let oldLine = 1
  let newLine = 1
  for (let index = 0; index < prefix; index += 1) all.push({ op: ' ', text: a[index]!, oldLine: oldLine++, newLine: newLine++ })
  let ai = prefix
  let bi = prefix
  for (const op of middleOps(midA, midB)) {
    if (op === ' ') { all.push({ op, text: a[ai++]!, oldLine: oldLine++, newLine: newLine++ }); bi += 1 }
    else if (op === '-') all.push({ op, text: a[ai++]!, oldLine: oldLine++, newLine })
    else all.push({ op, text: b[bi++]!, oldLine, newLine: newLine++ })
  }
  for (let index = a.length - suffix; index < a.length; index += 1) all.push({ op: ' ', text: a[index]!, oldLine: oldLine++, newLine: newLine++ })

  const hunks: string[] = []
  let index = 0
  while (index < all.length) {
    while (index < all.length && all[index]!.op === ' ') index += 1
    if (index >= all.length) break
    const start = Math.max(0, index - context)
    let end = index
    // Extend while the next change lies within two contexts of the last one.
    for (let cursor = index; cursor < all.length; cursor += 1) {
      if (all[cursor]!.op !== ' ') end = cursor
      else if (cursor - end > context * 2) break
    }
    const stop = Math.min(all.length, end + context + 1)
    const slice = all.slice(start, stop)
    const oldCount = slice.filter(line => line.op !== '+').length
    const newCount = slice.filter(line => line.op !== '-').length
    const first = slice[0]!
    hunks.push([`@@ -${first.oldLine},${oldCount} +${first.newLine},${newCount} @@`, ...slice.map(line => `${line.op}${line.text}`)].join('\n'))
    index = stop
  }
  return hunks.join('\n')
}
