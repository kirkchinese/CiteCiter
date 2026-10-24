import type { BoardElementState } from '../board.ts'
import { isSafeSvg, neutralizeMarkdownImages } from './rich-content.ts'

/** Decode common and numeric HTML entities in board labels without requiring a DOM. */
export function decodeBoardCitationEntities(text: string): string {
  const named: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' }
  return text.replaceAll(/&(#(?:x[\da-f]+|\d+)|amp|lt|gt|quot|apos|nbsp);/giu, (match, entity: string) => {
    if (entity[0] !== '#') return named[entity.toLowerCase()] ?? match
    const hex = entity[1]?.toLowerCase() === 'x'
    const code = Number.parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10)
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match
  })
}

/** Keep extracted diagram text literal when its draft preview is rendered as Markdown. */
function literalLines(text: string): string {
  return neutralizeMarkdownImages(decodeBoardCitationEntities(text))
    .replaceAll(/<(?=[a-z!/?])/giu, '<\u200b').split('\n').join('  \n')
}

function diagramText(element: BoardElementState): string {
  if (element.kind === 'svg') {
    if (!isSafeSvg(element.content)) return ''
    const parsed = new DOMParser().parseFromString(element.content, 'image/svg+xml')
    if (parsed.querySelector('parsererror') !== null) return ''
    return [...parsed.querySelectorAll('text, title, desc')]
      .filter(node => node.closest('defs, clipPath, mask, symbol, pattern, marker, [display="none"], [visibility="hidden"]') === null)
      .map(node => node.textContent?.replaceAll(/\s+/gu, ' ').trim() ?? '')
      .filter(Boolean).join('\n')
  }
  if (element.kind !== 'html') return ''
  // A detached template never executes scripts or loads resources. Do not insert
  // the source into the live page, or include styles/scripts as quoted prose.
  const template = document.createElement('template')
  template.innerHTML = element.content
  for (const node of template.content.querySelectorAll('script, style, template, noscript, head, [hidden], [aria-hidden="true"]')) node.remove()
  for (const node of template.content.querySelectorAll('br')) node.replaceWith('\n')
  for (const node of template.content.querySelectorAll('p, div, li, tr, h1, h2, h3, h4, h5, h6, section, article, pre')) node.append('\n')
  return (template.content.textContent ?? '').split('\n')
    .map(line => line.replaceAll(/\s+/gu, ' ').trim()).filter(Boolean).join('\n')
}

/**
 * Quote the selected board element without exposing its raw SVG/HTML or image bytes.
 * @param element - the actual selected element from the current Topic board.
 * @returns removable draft content; graphic-only references ask for visual inspection
 * after manual submission rather than inventing text or starting a model request.
 */
export function boardCitationPrompt(element: BoardElementState): string {
  if (element.kind === 'math') return `$$\n${element.content}\n$$`
  if (element.kind === 'markdown' || element.kind === 'table') return element.content
  if (element.kind === 'text') return literalLines(element.content)
  const text = diagramText(element)
  const label = element.kind === 'image' ? '图片' : '图示'
  const reference = `板书${label}「${literalLines(element.id)}」`
  return text === ''
    ? `${reference}：请结合当前板书查看图形内容后回答。`
    : `${reference}中的文字：\n\n${literalLines(text)}\n\n图形关系请结合当前板书核对。`
}
