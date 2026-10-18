import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { ContentBlock } from '@deepseek-ai/dsh-llm'
import { defineTool } from '@deepseek-ai/dsh-tools'
import type { Agent } from '@deepseek-ai/dsh-agent'
import type { BoardSnapshot } from './board.ts'
import type { BoardCaptureJob } from './board-capture-protocol.ts'

/** Most frames one blackboard_view call may request. */
export const BOARD_VIEW_MAX_FRAMES = 6

/** Correlates one model-requested render with one client reply; bytes become a durable DSH attachment. */
export class BoardCaptureBroker {
  private readonly pending = new Map<string, { job: BoardCaptureJob, resolve: (png: string) => void, reject: (error: Error) => void }>()
  id(sessionId: string): string | undefined { return this.pending.get(sessionId)?.job.id }
  /** Only live capture requests are advertised; polling does not load or resume other Topics. */
  jobs(): BoardCaptureJob[] { return [...this.pending.values()].map(item => item.job) }
  reply(sessionId: string, id: string, png?: string, error?: string): void {
    const pending = this.pending.get(sessionId)
    if (pending === undefined || pending.job.id !== id) return
    if (png !== undefined) pending.resolve(png)
    else pending.reject(new Error(error ?? '黑板截图失败'))
  }
  dispose(): void { for (const item of this.pending.values()) item.reject(new Error('Citer 已关闭')); this.pending.clear() }
  private capture(sessionId: string, board: BoardSnapshot, signal: AbortSignal, atMs?: number): Promise<string> {
    if (this.pending.has(sessionId)) return Promise.reject(new Error('黑板截图已在进行'))
    return new Promise((resolve, reject) => {
      const finish = (error?: Error, png?: string) => {
        clearTimeout(timer); signal.removeEventListener('abort', abort); this.pending.delete(sessionId)
        if (error !== undefined) reject(error); else resolve(png!)
      }
      const abort = () => finish(new Error('黑板截图已取消'))
      const timer = setTimeout(() => finish(new Error('未收到黑板截图；请保持 DSH Web 或 Desktop 页面连接后重试')), 20000)
      const job: BoardCaptureJob = { id: randomUUID(), sessionId, board, ...(atMs === undefined ? {} : { atMs }) }
      this.pending.set(sessionId, { job, resolve: png => finish(undefined, png), reject: error => finish(error) })
      signal.addEventListener('abort', abort, { once: true })
      if (signal.aborted) abort()
    })
  }
  /** Tool returns the browser-rendered board image inside the current turn; it never starts another prompt. */
  tool(ctx: Context, readBoard: (agent: Agent) => BoardSnapshot) {
    return defineTool({
      name: 'blackboard_view',
      description: `Inspect the actual rendered blackboard image before judging visual quality. The image contains only the board, not the surrounding conversation or window layout. It captures the visible board when available, otherwise the requested revision rendered offscreen at 1000 by 680 pixels. Review labels, clipping, overlaps and geometry; use blackboard_apply to fix issues. With atMs, it renders the board's animation timeline frozen at each listed time (up to ${BOARD_VIEW_MAX_FRAMES}), so you can check key moments of a blackboard_animate timeline. Requires a connected DSH Web or Desktop page; the Citer panel may be closed or showing another Topic. Sandboxed HTML frames cannot be captured; use SVG for inspectable diagrams.`,
      parameters: {
        atMs: { type: 'array', items: { type: 'integer' }, description: `Optional timeline times in ms to render, at most ${BOARD_VIEW_MAX_FRAMES}. Requires a timeline from blackboard_animate. Omit for the resting board.` },
      },
      output: {
        schema: { type: 'object', additionalProperties: false, properties: { images: { type: 'array', items: { type: 'json' }, required: true }, atMs: { type: 'array', items: { type: 'integer' }, required: true } } },
        render: (_args, value) => value.atMs.length === 0
          ? value.images.map(image => ({ type: 'image', attachment: image as unknown as ImageAttachmentRef }) as ContentBlock)
          : value.images.flatMap((image, index) => [
            { type: 'text', text: `Frame at ${value.atMs[index]} ms:` } as ContentBlock,
            { type: 'image', attachment: image as unknown as ImageAttachmentRef } as ContentBlock,
          ]),
      },
      execute: async (args, exec) => {
        if (exec.agent === undefined) throw new Error('黑板截图需要 Topic 会话')
        const board = readBoard(exec.agent)
        const times = [...new Set(args.atMs ?? [])]
        if (times.length > BOARD_VIEW_MAX_FRAMES) throw new Error(`atMs accepts at most ${BOARD_VIEW_MAX_FRAMES} times`)
        if (times.length > 0) {
          const timeline = board.timeline
          if (timeline === null || timeline === undefined) throw new Error('atMs requires a board animation; call blackboard_animate first')
          if (times.some(time => !Number.isInteger(time) || time < 0 || time > timeline.spec.durationMs)) throw new Error(`atMs values must be integers from 0 to ${timeline.spec.durationMs}`)
        }
        const images: Awaited<ReturnType<typeof ctx.attachments.saveImage>>[] = []
        for (const atMs of times.length === 0 ? [undefined] : times) {
          const png = await this.capture(exec.agent.session.header.id, board, exec.signal, atMs)
          const image = await ctx.attachments.saveImage({ data: Buffer.from(png, 'base64'), mediaType: 'image/png', name: atMs === undefined ? 'Citer blackboard.png' : `Citer blackboard ${atMs}ms.png` })
          images.push(image)
        }
        return { images: images.map(image => ({ ...image })), atMs: times }
      },
      presentCall: () => ({ card: 'generic', title: '检查黑板视觉效果' }),
    })
  }
}
