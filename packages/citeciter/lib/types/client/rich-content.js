const MAX_RICH_SOURCE_LENGTH = 200_000;
const RICH_FENCE = /^```(?<kind>svg|html)[ \t]*\r?\n(?<source>[\s\S]*?)^```[ \t]*$/gimu;
const HTML_CSP = "default-src 'none'; style-src 'unsafe-inline'; img-src data:; font-src data:";
/**
 * Split complete safe rich fences from Markdown while preserving all prose.
 * @param text - current assistant response text.
 * @returns ordered Markdown and isolated rich-preview segments.
 */
export function splitRichContent(text) {
    const segments = [];
    let cursor = 0;
    for (const match of text.matchAll(RICH_FENCE)) {
        const index = match.index ?? 0;
        if (index > cursor)
            pushMarkdown(segments, text.slice(cursor, index));
        const wholeFence = match[0];
        const kind = match.groups?.kind?.toLowerCase();
        const source = match.groups?.source ?? '';
        if (kind === 'svg' && isSafeSvg(source)) {
            const normalized = source.trim();
            segments.push({
                kind: 'svg',
                source: normalized,
                dataUrl: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(normalized)}`,
            });
        }
        else if (kind === 'html' && isPreviewableHtml(source)) {
            segments.push({ kind: 'html', document: isolatedHtmlDocument(source.trim()) });
        }
        else {
            pushMarkdown(segments, wholeFence);
        }
        cursor = index + wholeFence.length;
    }
    if (cursor < text.length || segments.length === 0)
        pushMarkdown(segments, text.slice(cursor));
    return segments;
}
/**
 * Check whether SVG markup is self-contained and non-active.
 * @param source - SVG fence body.
 * @returns whether the source may be rendered as an inert image preview.
 */
export function isSafeSvg(source) {
    const svg = source.trim();
    if (svg.length === 0 || svg.length > MAX_RICH_SOURCE_LENGTH)
        return false;
    if (!/^<svg(?:\s|>)/iu.test(svg) || !/<\/svg\s*>$/iu.test(svg))
        return false;
    if (/<\/?(?:script|foreignobject|iframe|object|embed|audio|video|canvas)\b/iu.test(svg))
        return false;
    if (/\son[a-z][a-z0-9:_-]*\s*=/iu.test(svg))
        return false;
    if (/\b(?:href|xlink:href)\s*=/iu.test(svg))
        return false;
    if (/\b(?:javascript|vbscript)\s*:/iu.test(svg))
        return false;
    // CSS paint server references (`url(#marker)`) are safe; every other URL is rejected.
    if (/url\(\s*(?:['"]?\s*)?(?!#)/iu.test(svg))
        return false;
    return true;
}
/**
 * Build a network-free, script-free iframe document for an HTML fence.
 * @param source - HTML fence body.
 * @returns complete iframe `srcDoc` markup with restrictive CSP metadata.
 */
export function isolatedHtmlDocument(source) {
    return [
        '<!doctype html><html><head>',
        `<meta http-equiv="Content-Security-Policy" content="${HTML_CSP}">`,
        '<meta name="referrer" content="no-referrer">',
        '<style>html{color-scheme:light dark}body{margin:0;padding:12px;font:14px/1.5 system-ui,sans-serif;overflow-wrap:anywhere}</style>',
        '</head><body>',
        source,
        '</body></html>',
    ].join('');
}
function isPreviewableHtml(source) {
    return source.trim().length > 0 && source.length <= MAX_RICH_SOURCE_LENGTH;
}
function pushMarkdown(segments, text) {
    if (text !== '')
        segments.push({ kind: 'markdown', text });
}
