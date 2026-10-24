/** Chinese presentation copy owned by CiteCiter, including shared primitive chrome. */
import type { CodeToolbarLabels, DiffBlockLabels, JsonTreeLabels, MarkdownLabels, ReadBlockLabels, SearchBlockLabels, TerminalBlockLabels } from '@deepseek-ai/dsh-client-ui-primitives';
/** Localized labels supplied to the Cordis-free Markdown renderer. */
export declare const markdownLabels: MarkdownLabels;
/** Localized labels supplied to the Cordis-free JSON inspector. */
export declare const jsonTreeLabels: JsonTreeLabels;
/** Shared toolbar copy for read and diff code surfaces. */
export declare const codeToolbarLabels: CodeToolbarLabels;
/** DSH-style labels for numbered file reads. */
export declare const readBlockLabels: ReadBlockLabels;
/** DSH-style labels for applied file differences. */
export declare const diffBlockLabels: DiffBlockLabels;
/** Terminal status and output controls. */
export declare const terminalBlockLabels: TerminalBlockLabels & {
    commandLine: (line: number) => string;
};
/** Result-count labels for grouped grep matches and glob paths. */
export declare const searchBlockLabels: SearchBlockLabels;
