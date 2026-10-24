/** Presentation copy for shared UI primitives. */
import type { CodeToolbarLabels, DiffBlockLabels, JsonTreeLabels, MarkdownLabels, ReadBlockLabels, SearchBlockLabels, TerminalBlockLabels } from '@deepseek-ai/dsh-client-ui-primitives'
import { t } from './i18n.ts'

/** Live getters keep consumers outside the transcript slice localized without changing their API. */
export const markdownLabels: MarkdownLabels = {
  code: {
    get copyLabel() { return t('transcript.copy.code') },
    get copiedLabel() { return t('transcript.copy.copied') },
  },
  get footnotes() { return t('transcript.copy.footnotes') },
}

/** Localized labels supplied to the Cordis-free JSON inspector. */
export function jsonTreeLabels(): JsonTreeLabels {
  return {
    copyValue: t('transcript.copy.value'), copyJson: t('transcript.copy.json'),
    copyPath: t('transcript.copy.path'), copyPrettyJson: t('transcript.copy.prettyJson'),
    copyCompactJson: t('transcript.copy.compactJson'), copied: t('transcript.copy.copied'),
    copyFailed: t('transcript.copy.failed'), collapseNode: t('transcript.copy.collapseNode'),
    expandNode: t('transcript.copy.expandNode'), copyButtonTitle: action => action,
  }
}

/** Shared toolbar copy for read and diff code surfaces. */
export function codeToolbarLabels(): CodeToolbarLabels {
  return { codeLabel: t('transcript.copy.codeLabel'), wrapLabel: t('transcript.copy.wrap'), unwrapLabel: t('transcript.copy.unwrap') }
}

/** DSH-style labels for numbered file reads. */
export function readBlockLabels(): ReadBlockLabels {
  return {
    ...codeToolbarLabels(),
    window: (shown, total) => t('transcript.copy.window', { shown, total }),
    copy: t('transcript.copy.copy'), copied: t('transcript.copy.copied'),
    collapseAria: t('transcript.copy.collapseContent'), expandAria: hidden => t('transcript.copy.expandRemaining', { hidden }),
    collapse: t('transcript.copy.collapse'), expand: hidden => t('transcript.copy.remaining', { hidden }),
  }
}

/** DSH-style labels for applied file differences. */
export function diffBlockLabels(): DiffBlockLabels {
  return {
    ...codeToolbarLabels(),
    copy: t('transcript.copy.copy'), copied: t('transcript.copy.copied'),
    collapseAria: t('transcript.copy.collapseDiff'), expandAria: hidden => t('transcript.copy.expandDiff', { hidden }),
    collapse: t('transcript.copy.collapse'), expand: hidden => t('transcript.copy.remaining', { hidden }),
  }
}

/** Terminal status and output controls. */
export function terminalBlockLabels(): TerminalBlockLabels & { commandLine: (line: number) => string } {
  return {
    commandLine: line => t('transcript.copy.commandLine', { line }),
    signal: signal => t('transcript.copy.signal', { signal }), exitCode: code => t('transcript.copy.exitCode', { code }),
    noExitCode: t('transcript.copy.noExitCode'), running: t('transcript.copy.running'),
    failed: t('transcript.copy.failedStatus'), done: t('transcript.copy.done'),
    copy: t('transcript.copy.copy'), copied: t('transcript.copy.copied'), noOutput: t('transcript.copy.noOutput'),
    collapseAria: t('transcript.copy.collapseOutput'), collapse: t('transcript.copy.collapse'),
    expandAria: hidden => t('transcript.copy.expandOutput', { hidden }), expand: hidden => t('transcript.copy.remainingOutput', { hidden }),
  }
}

/** Result-count labels for grouped grep matches and glob paths. */
export function searchBlockLabels(): SearchBlockLabels {
  return {
    pathsSummary: (shown, total, truncated) => t(truncated ? 'transcript.copy.pathsShown' : 'transcript.copy.paths', { shown, total }),
    matchesSummary: (shown, total, files, truncated) => t(truncated ? 'transcript.copy.matchesShown' : 'transcript.copy.matches', { shown, total, files }),
    copy: t('transcript.copy.copy'), copied: t('transcript.copy.copied'), noResults: t('transcript.copy.noResults'),
    collapseAria: t('transcript.copy.collapseResults'), collapse: t('transcript.copy.collapse'),
    expandAria: hidden => t('transcript.copy.expandResults', { hidden }), expand: hidden => t('transcript.copy.remaining', { hidden }),
  }
}
