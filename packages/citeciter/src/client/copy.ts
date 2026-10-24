/** Chinese presentation copy owned by CiteCiter, including shared primitive chrome. */
import type { CodeToolbarLabels, DiffBlockLabels, JsonTreeLabels, MarkdownLabels, ReadBlockLabels, SearchBlockLabels, TerminalBlockLabels } from '@deepseek-ai/dsh-client-ui-primitives'

/** Localized labels supplied to the Cordis-free Markdown renderer. */
export const markdownLabels: MarkdownLabels = {
  code: { copyLabel: '复制代码', copiedLabel: '已复制' },
  footnotes: '脚注',
}

/** Localized labels supplied to the Cordis-free JSON inspector. */
export const jsonTreeLabels: JsonTreeLabels = {
  copyValue: '复制值',
  copyJson: '复制 JSON',
  copyPath: '复制路径',
  copyPrettyJson: '复制格式化 JSON',
  copyCompactJson: '复制紧凑 JSON',
  copied: '已复制',
  copyFailed: '复制失败',
  collapseNode: '折叠节点',
  expandNode: '展开节点',
  copyButtonTitle: (action) => action,
}

/** Shared toolbar copy for read and diff code surfaces. */
export const codeToolbarLabels: CodeToolbarLabels = {
  codeLabel: '代码',
  wrapLabel: '自动换行',
  unwrapLabel: '不换行',
}

/** DSH-style labels for numbered file reads. */
export const readBlockLabels: ReadBlockLabels = {
  ...codeToolbarLabels,
  window: (shown, total) => `显示 ${shown} / ${total} 行`,
  copy: '复制', copied: '已复制',
  collapseAria: '收起内容', expandAria: hidden => `展开其余 ${hidden} 行`,
  collapse: '收起', expand: hidden => `… 其余 ${hidden} 行`,
}

/** DSH-style labels for applied file differences. */
export const diffBlockLabels: DiffBlockLabels = {
  ...codeToolbarLabels,
  copy: '复制', copied: '已复制',
  collapseAria: '收起差异', expandAria: hidden => `展开其余 ${hidden} 行差异`,
  collapse: '收起', expand: hidden => `… 其余 ${hidden} 行`,
}

/** Terminal status and output controls. */
export const terminalBlockLabels: TerminalBlockLabels & { commandLine: (line: number) => string } = {
  commandLine: line => `命令第 ${line} 行`,
  signal: signal => `信号 ${signal}`, exitCode: exitCode => `退出码 ${exitCode}`,
  noExitCode: '未正常退出', running: '运行中', failed: '失败', done: '已完成',
  copy: '复制', copied: '已复制', noOutput: '无输出',
  collapseAria: '收起输出', collapse: '收起',
  expandAria: hidden => `展开其余 ${hidden} 行输出`, expand: hidden => `… 其余 ${hidden} 行`,
}

/** Result-count labels for grouped grep matches and glob paths. */
export const searchBlockLabels: SearchBlockLabels = {
  pathsSummary: (shown, total, truncated) => truncated ? `显示 ${shown} / 共 ${total} 个路径` : `${shown} 个路径`,
  matchesSummary: (shown, total, files, truncated) => truncated
    ? `显示 ${shown} / 共 ${total} 处匹配 · ${files} 个文件` : `${shown} 处匹配 · ${files} 个文件`,
  copy: '复制', copied: '已复制', noResults: '无结果',
  collapseAria: '收起结果', collapse: '收起',
  expandAria: hidden => `展开其余 ${hidden} 行结果`, expand: hidden => `… 其余 ${hidden} 行`,
}
