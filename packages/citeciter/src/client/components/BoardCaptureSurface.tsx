import { useEffect, useRef } from 'react'
import { toPng } from 'html-to-image'
import type { BoardSnapshot } from '../../board.ts'
import { BoardView } from './BoardView.tsx'

/** Reuses the exact board renderer when its visible tab is closed; no synthetic drawing or extra conversation is created. */
export function BoardCaptureSurface({ id, sessionId, board, reply }: {
  readonly id: string
  readonly sessionId: string
  readonly board: BoardSnapshot | undefined
  readonly reply: (sessionId: string, id: string, png?: string, error?: string) => Promise<void>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const sent = useRef(false)
  useEffect(() => {
    let disposed = false
    const capture = async () => {
      await document.fonts.ready
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      if (disposed || sent.current || ref.current === null) return
      sent.current = true
      try {
        const visible = [...document.querySelectorAll<HTMLElement>('[data-citeciter-board]')].find(node => !ref.current?.contains(node) && node.dataset.citeciterBoard === sessionId && node.dataset.boardRevision === String(board?.revision ?? 0) && node.getBoundingClientRect().width > 0)
        const target = visible ?? ref.current.firstElementChild as HTMLElement
        if (target.querySelector('iframe')) throw new Error('隔离 HTML 动画不能截取；请改用 SVG 板书')
        const data = await toPng(target, { pixelRatio: 1, cacheBust: false, filter: node => !(node instanceof Element) || node.tagName !== 'BUTTON', style: { animation: 'none', transform: 'none' } })
        if (!disposed) await reply(sessionId, id, data.slice(data.indexOf(',') + 1))
      } catch (error) { if (!disposed) await reply(sessionId, id, undefined, error instanceof Error ? error.message : String(error)) }
    }
    void capture()
    return () => { disposed = true }
  }, [id, sessionId, reply])
  return <div ref={ref} aria-hidden="true" style={{ position: 'fixed', left: -10000, top: 0, width: 1000, height: 680, display: 'flex', pointerEvents: 'none' }}><BoardView sessionId={sessionId} snapshot={board} animations={false} /></div>
}
