/** Presentation copy for shared UI primitives. */
import type { CodeToolbarLabels, DiffBlockLabels, JsonTreeLabels, MarkdownLabels, ReadBlockLabels, SearchBlockLabels, TerminalBlockLabels } from '@deepseek-ai/dsh-client-ui-primitives';
/** Live getters keep consumers outside the transcript slice localized without changing their API. */
export declare const markdownLabels: MarkdownLabels;
/** Localized labels supplied to the Cordis-free JSON inspector. */
export declare function jsonTreeLabels(): JsonTreeLabels;
/** Shared toolbar copy for read and diff code surfaces. */
export declare function codeToolbarLabels(): CodeToolbarLabels;
/** DSH-style labels for numbered file reads. */
export declare function readBlockLabels(): ReadBlockLabels;
/** DSH-style labels for applied file differences. */
export declare function diffBlockLabels(): DiffBlockLabels;
/** Terminal status and output controls. */
export declare function terminalBlockLabels(): TerminalBlockLabels & {
    commandLine: (line: number) => string;
};
/** Result-count labels for grouped grep matches and glob paths. */
export declare function searchBlockLabels(): SearchBlockLabels;
