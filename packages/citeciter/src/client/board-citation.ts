import type { BoardElementState } from '../board.ts'
import { isSafeSvg } from './rich-content.ts'

/** Keep extracted diagram text literal when its draft preview is rendered as Markdown. */
function literalLines(text: string): string {
  // Backslash escapes such as \(...\) and \[...\] are math delimiters in
  // the Host renderer. Character entities stay literal in both Markdown and math.
  return text.split('\n').map(line => line.replaceAll(/[&\\`*_$\[\]<>#!|~+-]/gu,
    char => `&#${char.codePointAt(0)!};`)).join('  \n')
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
