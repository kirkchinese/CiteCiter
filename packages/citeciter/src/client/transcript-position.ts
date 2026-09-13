import { useCallback, useLayoutEffect, useRef, type UIEvent } from 'react'

interface ReadingPosition { top: number, follow: boolean, anchor?: string, offset?: number }

function capture(node: HTMLDivElement): ReadingPosition {
  const child = [...node.children].find((child): child is HTMLElement => child instanceof HTMLElement && child.hasAttribute('data-citeciter-message') && child.offsetTop + child.offsetHeight > node.scrollTop + 1)
  const anchor = child?.getAttribute('data-citeciter-message')
  return { top: node.scrollTop, follow: node.scrollHeight - node.scrollTop - node.clientHeight < 80,
    ...(anchor == null || child === undefined ? {} : { anchor, offset: (node.scrollTop - child.offsetTop) / Math.max(1, child.offsetHeight) }),
  }
}

function restore(node: HTMLDivElement, position: ReadingPosition | undefined): void {
  if (position?.follow !== false) { node.scrollTop = node.scrollHeight; return }
  const child = [...node.children].find((child): child is HTMLElement => child instanceof HTMLElement && child.getAttribute('data-citeciter-message') === position.anchor)
  node.scrollTop = child === undefined ? position.top
    : child.offsetTop + (position.offset ?? 0) * child.offsetHeight
}

/** Keep each Topic's reading position across portal moves, view changes and close/reopen. Follow new output only while the reader is near the end. */
export function useTranscriptPosition(topicId: string, revision: unknown) {
  const positions = useRef(new Map<string, ReadingPosition>())
  const element = useRef<HTMLDivElement | null>(null)
  const ref = useCallback((node: HTMLDivElement | null) => {
    const previous = element.current
    if (previous !== null) {
      if (!positions.current.has(topicId)) positions.current.set(topicId, capture(previous))
    }
    element.current = node
    if (node !== null) {
      restore(node, positions.current.get(topicId))
    }
  }, [topicId])
  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    const node = event.currentTarget
    positions.current.set(topicId, capture(node))
  }, [topicId])
  useLayoutEffect(() => {
    const node = element.current
    if (node !== null && positions.current.get(topicId)?.follow !== false) node.scrollTop = node.scrollHeight
  }, [topicId, revision])
  return { ref, onScroll }
}
