import type { CiteSelection } from './types.ts';
/**
 * Build the explanation prompt recorded into the forked child session.
 * @param selection - quoted assistant text and its parent-log anchor.
 * @returns model-visible prompt text.
 */
export declare function buildPrompt(selection: CiteSelection): string;
