/**
 * Truncation that never splits a character. JavaScript strings count UTF-16 code units, and a character outside
 * the Basic Multilingual Plane (emoji such as 🔹, CJK extension B, math alphanumerics) takes two. Cutting between
 * them leaves a lone surrogate, which JSON serializes as an escape such as `"\udd39"` and strict JSON parsers,
 * including model APIs, reject: once such text is in a Topic's history, every later request fails.
 */
/** Move an end offset back so it does not fall inside a surrogate pair. */
export declare function snapEnd(text: string, end: number): number;
/** Move a start offset forward so it does not fall inside a surrogate pair. */
export declare function snapStart(text: string, start: number): number;
/** The first `limit` code units of `text`, one fewer when that would split a character. */
export declare function headOf(text: string, limit: number): string;
/** The last `limit` code units of `text`, one fewer when that would split a character. */
export declare function tailOf(text: string, limit: number): string;
/** `text[start, end)` with both ends moved off surrogate-pair middles: never longer than asked. */
export declare function sliceWhole(text: string, start: number, end?: number): string;
/**
 * Replace any lone surrogate with U+FFFD, keeping every offset. A last guard for text that reaches a model or
 * a log, whatever cut it upstream.
 */
export declare function wellFormed(text: string): string;
