import type { DraftContent } from '../draft-contract.ts'
import type { QuestionDraftContent } from '../question-draft-contract.ts'

interface Edit { start: number; end: number; text: string }

// Bound the edit search so replacing a large pasted answer cannot stall input.
function edits(before: readonly string[], after: readonly string[]): Edit[] {
  let start = 0
  let end = before.length
  let nextEnd = after.length
  while (start < end && start < nextEnd && before[start] === after[start]) start++
  while (end > start && nextEnd > start && before[end - 1] === after[nextEnd - 1]) { end--; nextEnd-- }
  if (start === end || start === nextEnd) return start === end && start === nextEnd ? [] : [{ start, end, text: after.slice(start, nextEnd).join('') }]
  const a = before.slice(start, end)
  const b = after.slice(start, nextEnd)
  const trace: Map<number, number>[] = []
  let frontier = new Map<number, number>([[1, 0]])
  let budget = 100_000
  for (let depth = 0; depth <= a.length + b.length; depth++) {
    trace.push(new Map(frontier))
    for (let diagonal = -depth; diagonal <= depth; diagonal += 2) {
      if (--budget < 0) return [{ start, end, text: b.join('') }]
      const down = frontier.get(diagonal + 1) ?? -1
      const right = frontier.get(diagonal - 1) ?? -1
      let x = diagonal === -depth || (diagonal !== depth && right < down) ? down : right + 1
      let y = x - diagonal
      while (x < a.length && y < b.length && a[x] === b[y]) { x++; y++; budget-- }
      frontier.set(diagonal, x)
      if (x < a.length || y < b.length) continue
      const operations: { kind: 'same' | 'insert' | 'delete'; text: string }[] = []
      for (let step = depth; step >= 0; step--) {
        const previous = trace[step]!
        const k = x - y
        const previousK = k === -step || (k !== step && (previous.get(k - 1) ?? -1) < (previous.get(k + 1) ?? -1)) ? k + 1 : k - 1
        const previousX = previous.get(previousK) ?? 0
        const previousY = previousX - previousK
        while (x > previousX && y > previousY) { operations.push({ kind: 'same', text: a[--x]! }); y-- }
        if (step === 0) break
        if (x === previousX) operations.push({ kind: 'insert', text: b[--y]! })
        else operations.push({ kind: 'delete', text: a[--x]! })
      }
      const result: Edit[] = []
      let position = start
      let edit: Edit | undefined
      for (const operation of operations.reverse()) {
        if (operation.kind === 'same') { edit = undefined; position++; continue }
        if (edit === undefined) { edit = { start: position, end: position, text: '' }; result.push(edit) }
        if (operation.kind === 'insert') edit.text += operation.text
        else edit.end = ++position
      }
      return result
    }
  }
  return []
}

function overlaps(a: Edit, b: Edit): boolean {
  if (a.start === a.end && b.start === b.end) return a.start === b.start
  if (a.start === a.end) return a.start >= b.start && a.start < b.end
  if (b.start === b.end) return b.start >= a.start && b.start < a.end
  return a.start < b.end && b.start < a.end
}

/** Three-way text merge. Independent edits survive; overlapping edits use the operating window. Unicode code points remain intact. */
export function mergeDraftText(base: string, local: string, remote: string, preferLocal: boolean): string {
  if (local === remote || remote === base) return local
  if (local === base) return remote
  const original = Array.from(base)
  const preferred = edits(original, Array.from(preferLocal ? local : remote))
  const other = edits(original, Array.from(preferLocal ? remote : local))
  const merged = [...preferred, ...other.filter(edit => !preferred.some(winner => overlaps(edit, winner)))].sort((a, b) => a.start - b.start)
  let result = ''
  let offset = 0
  for (const edit of merged) { result += original.slice(offset, edit.start).join('') + edit.text; offset = edit.end }
  return result + original.slice(offset).join('')
}

function choose<T>(base: T, local: T, remote: T, preferLocal: boolean): T {
  if (JSON.stringify(local) === JSON.stringify(base)) return remote
  if (JSON.stringify(remote) === JSON.stringify(base)) return local
  return preferLocal ? local : remote
}

function mergeItems<T extends { readonly id: string }>(base: readonly T[], local: readonly T[], remote: readonly T[], preferLocal: boolean): T[] {
  const before = new Map(base.map(item => [item.id, item]))
  const ours = new Map(local.map(item => [item.id, item]))
  const theirs = new Map(remote.map(item => [item.id, item]))
  return [...new Set([...remote, ...local].map(item => item.id))].flatMap(id => {
    const result = choose(before.get(id), ours.get(id), theirs.get(id), preferLocal)
    return result === undefined ? [] : [result]
  })
}

/** Merge real attachment/reference identities; removal wins over an unchanged copy, never recreating a deleted reference. */
export function mergeDraftContent(base: DraftContent, local: DraftContent, remote: DraftContent, preferLocal: boolean): DraftContent {
  return {
    text: mergeDraftText(base.text, local.text, remote.text, preferLocal),
    files: mergeItems(base.files, local.files, remote.files, preferLocal),
    references: mergeItems(base.references, local.references, remote.references, preferLocal),
  }
}

/** Merge independent questions and text edits; changing the selection keeps the whole answer atomic so single-choice and custom answers cannot be combined. */
export function mergeQuestionDraft(base: QuestionDraftContent, local: QuestionDraftContent, remote: QuestionDraftContent, preferLocal: boolean): QuestionDraftContent {
  const answers: QuestionDraftContent['answers'] = {}
  for (const id of new Set([...Object.keys(local.answers), ...Object.keys(remote.answers)])) {
    const before = base.answers[id]
    const ours = local.answers[id]
    const theirs = remote.answers[id]
    const result = ours === undefined || theirs === undefined ? choose(before, ours, theirs, preferLocal)
      : JSON.stringify(ours.selected) !== JSON.stringify(theirs.selected)
        ? choose(before ?? { selected: [], custom: '' }, ours, theirs, preferLocal)
        : { selected: ours.selected, custom: mergeDraftText(before?.custom ?? '', ours.custom, theirs.custom, preferLocal) }
    if (result !== undefined) answers[id] = result
  }
  // Reconciliation must not move the operating window away from the answer being typed.
  const page = preferLocal ? local.page : choose(base.page, local.page, remote.page, false)
  return { answers, page, edited: local.edited || remote.edited, held: local.held || remote.held }
}
