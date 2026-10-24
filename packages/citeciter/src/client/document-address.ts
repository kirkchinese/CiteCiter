/** Addresses of Citer's library documents in DSH's right sidebar. */

/** Tab type id and kind of Citer's document tabs. */
export const DOCUMENT_TAB_ID = '@kirkchinese/dsh-citeciter/document'
export const DOCUMENT_TAB_KIND = 'citeciter-document'

const PREFIX = 'dsh-resource://citeciter-document/'

/** Glob the document tab type claims. */
export const DOCUMENT_ADDRESS_PATTERN = `${PREFIX}**`

/** @returns the sidebar address of one library document. */
export function documentAddress(documentId: string): string {
  return `${PREFIX}${encodeURIComponent(documentId)}`
}

/** @returns the document id of a Citer document address, or undefined for any other address. */
export function documentIdFromAddress(address: string): string | undefined {
  if (!address.startsWith(PREFIX)) return undefined
  try {
    const id = decodeURIComponent(address.slice(PREFIX.length))
    return id === '' || id.includes('/') ? undefined : id
  } catch {
    // URIError: a malformed escape is not a Citer document.
    return undefined
  }
}
