import type { MainQuote } from '../main-quote.ts';
/**
 * A quote the user sent to the main agent, drawn inside the sent message like DSH's own
 * reference chips: a quote mark and a short preview; the whole passage is in the tooltip.
 * @param node - the matched quote, from Citer's user-text rule.
 */
export declare function QuoteReference({ node }: {
    readonly node: {
        readonly data: MainQuote;
    };
}): import("react").JSX.Element;
