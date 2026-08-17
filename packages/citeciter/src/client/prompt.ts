import type { CiteSelection } from './types.ts'

/** Parse the leading `<seq>:` from a conversation anchor key. */
export function parseAnchorSeq(anchorKey: string): number | null {
  const match = /^(\d+):/u.exec(anchorKey)
  const value = match?.[1]
  if (value === undefined) return null
  const seq = Number(value)
  return Number.isSafeInteger(seq) && seq >= 0 ? seq : null
}

/** The prompt template recorded into the explainer child session. */
export function buildPrompt(selection: CiteSelection): string {
  return [
    '你是 CiteCiter 解释器。只解释下面引用的内容，不执行任务、不修改任何文件，不要请求提升沙箱权限。',
    `[引用自主会话 anchor=${selection.anchorKey}]`,
    '<<<',
    selection.text,
    '>>>',
    '要求：先给一句话直觉解释，再展开原理。数学用 $...$；代码使用带语言围栏；如需图，输出一个 ```svg 围栏（不要 script/foreignObject）。不要输出与引用无关的内容。',
  ].join('\n\n')
}
