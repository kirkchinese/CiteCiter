import type { CiteSelection } from './types.ts';
/** Parse the leading `<seq>:` from a conversation anchor key. */
export declare function parseAnchorSeq(anchorKey: string): number | null;
/** The prompt template recorded into the explainer child session. */
export declare function buildPrompt(selection: CiteSelection): string;
