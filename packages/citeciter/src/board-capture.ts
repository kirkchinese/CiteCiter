import { randomUUID } from 'node:crypto'
import type { Context } from '@deepseek-ai/cordis'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { defineTool } from '@deepseek-ai/dsh-tools'

/** Correlates one model-requested render with one client reply; bytes become a durable DSH attachment. */
export class BoardCaptureBroker {
  private readonly pending = new Map<string, { id: string, resolve: (png: string) => void, reject: (error: Error) => void }>()
  id(sessionId: string): string | undefined { return this.pending.get(sessionId)?.id }
  reply(sessionId: string, id: string, png?: string, error?: string): void {
    const pending = this.pending.get(sessionId)
    if (pending === undefined || pending.id !== id) return
    if (png !== undefined) pending.resolve(png)
    else pending.reject(new Error(error ?? '黑板截图失败'))
  }
  dispose(): void { for (const item of this.pending.values()) item.reject(new Error('Citer 已关闭')); this.pending.clear() }
  private capture(sessionId: string, signal: AbortSignal): Promise<string> {
    if (this.pending.has(sessionId)) return Promise.reject(new Error('黑板截图已在进行'))
    return new Promise((resolve, reject) => {
      const finish = (error?: Error, png?: string) => {
        clearTimeout(timer); signal.removeEventListener('abort', abort); this.pending.delete(sessionId)
        if (error !== undefined) reject(error); else resolve(png!)
      }
      const abort = () => finish(new Error('黑板截图已取消'))
      const timer = setTimeout(() => finish(new Error('未收到黑板截图；请打开 Citer 后重试')), 20000)
      this.pending.set(sessionId, { id: randomUUID(), resolve: png => finish(undefined, png), reject: error => finish(error) })
      signal.addEventListener('abort', abort, { once: true })
      if (signal.aborted) abort()
    })
  }
  /** Tool returns the browser-rendered board image inside the current turn; it never starts another prompt. */
  tool(ctx: Context) {
    return defineTool({
      name: 'blackboard_view',
      description: 'Inspect the actual rendered blackboard image before judging visual quality. Review labels, clipping, overlaps and geometry; use blackboard_apply to fix issues. Requires an open Citer client. Sandboxed HTML frames cannot be captured; use SVG for inspectable diagrams.',
      parameters: {},
      output: {
        schema: { type: 'object', additionalProperties: false, properties: { image: { type: 'json', required: true } } },
        render: (_args, value) => [{ type: 'image', attachment: value.image as unknown as ImageAttachmentRef }],
      },
      execute: async (_args, exec) => {
        if (exec.agent === undefined) throw new Error('黑板截图需要 Topic 会话')
        const png = await this.capture(exec.agent.session.header.id, exec.signal)
        const image = await ctx.attachments.saveImage({ data: Buffer.from(png, 'base64'), mediaType: 'image/png', name: 'Citer blackboard.png' })
        return { image: { ...image } }
      },
      presentCall: () => ({ card: 'generic', title: '检查黑板视觉效果' }),
    })
  }
}
