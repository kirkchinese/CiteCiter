/** Shared Host/Client page budget; full text stays in the document owner. */
export const DOCUMENT_CONTENT_MAX_BYTES = 500 * 1024

/** Split UTF-8 text without breaking code points; concatenation exactly reproduces the input. */
export function documentPages(content: string): string[] {
  const pages: string[] = []
  let start = 0, offset = 0, bytes = 0
  for (const character of content) {
    const code = character.codePointAt(0)!
    const size = code < 0x80 ? 1 : code < 0x800 ? 2 : code < 0x10000 ? 3 : 4
    if (bytes + size > DOCUMENT_CONTENT_MAX_BYTES) { pages.push(content.slice(start, offset)); start = offset; bytes = 0 }
    offset += character.length
    bytes += size
  }
  pages.push(content.slice(start))
  return pages
}
