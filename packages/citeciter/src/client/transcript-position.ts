import { useCallback, useLayoutEffect, useRef, type UIEvent } from 'react'

interface ReadingPosition { top: number, follow: boolean, anchor?: string, offset?: number }

interface TranscriptBinding {
  readonly node: HTMLDivElement
  readonly reconcile: () => void
  readonly scroll: () => void
  readonly dispose: () => void
}

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

/** Observe the transcript and its messages: a loaded image can change scrollHeight without resizing the scroll container. */
function bindTranscript(node: HTMLDivElement, read: () => ReadingPosition | undefined, write: (value: ReadingPosition) => void): TranscriptBinding {
  let height = 0
  let width = 0
  let contentHeight = 0
  let restoredTop = -1
  const changed = () => height !== node.clientHeight || width !== node.clientWidth || contentHeight !== node.scrollHeight
  const reconcile = () => {
    restore(node, read())
    height = node.clientHeight
    width = node.clientWidth
    contentHeight = node.scrollHeight
    restoredTop = node.scrollTop
  }
  const resize = new ResizeObserver(reconcile)
  const children = new Set<Element>()
  const observeChildren = () => {
    for (const child of children) {
      if (child.parentElement !== node) { resize.unobserve(child); children.delete(child) }
    }
    for (const child of node.children) {
      if (!children.has(child)) { children.add(child); resize.observe(child) }
    }
    reconcile()
  }
  const mutations = new MutationObserver(observeChildren)
  resize.observe(node)
  mutations.observe(node, { childList: true })
  observeChildren()
  return {
    node,
    reconcile,
    scroll() {
      // Reflow and programmatic restoration also emit scroll events. Neither is a reader choosing an older message.
      if (changed()) { reconcile(); return }
      if (Math.abs(node.scrollTop - restoredTop) < 1) return
      write(capture(node))
      restoredTop = node.scrollTop
    },
    dispose() { resize.disconnect(); mutations.disconnect(); children.clear() },
  }
}

/** Keep each Topic's reading position across portal moves, image loading, view changes and close/reopen. Follow new output only while the reader is near the end. */
export function useTranscriptPosition(topicId: string, revision: unknown) {
  const positions = useRef(new Map<string, ReadingPosition>())
  const binding = useRef<TranscriptBinding | null>(null)
  const currentTopic = useRef(topicId)
  currentTopic.current = topicId
  const ref = useCallback((node: HTMLDivElement | null) => {
    binding.current?.dispose()
    binding.current = null
    if (node !== null) {
      if (!positions.current.has(topicId)) positions.current.set(topicId, { top: 0, follow: true })
      binding.current = bindTranscript(node, () => positions.current.get(topicId), value => positions.current.set(topicId, value))
    }
  }, [topicId])
  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    if (event.currentTarget === binding.current?.node) binding.current.scroll()
  }, [])
  useLayoutEffect(() => {
    binding.current?.reconcile()
  }, [topicId, revision])
  /** Call after a manual submission is accepted. A late receipt must not scroll another Topic. */
  const followLatest = useCallback(() => {
    positions.current.set(topicId, { top: 0, follow: true })
    if (currentTopic.current === topicId) binding.current?.reconcile()
  }, [topicId])
  return { ref, onScroll, followLatest }
}
