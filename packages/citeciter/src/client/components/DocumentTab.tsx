import { useEffect } from 'react'
import type { SnapshotSelectorHook } from '@deepseek-ai/dsh-client-store'
import type { UseSidebarRightTabInfo } from '@deepseek-ai/dsh-client-ui-sidebar-right/client'
import type { DocumentLibrarySnapshot } from '../document-library.ts'
import { documentIdFromAddress } from '../document-address.ts'
import { LibraryDocument, type LibraryDocumentProps } from './LibraryDocument.tsx'
import { t, useLocale } from '../i18n.ts'
import css from './LibraryDocument.module.css'

declare module '@deepseek-ai/dsh-client-ui-sidebar-right/client' {
  interface SidebarRightResourceParamsMap {
    /** Where to open a Citer document: the source offset to scroll to. */
    citeciterDocument: { readonly offset?: number }
  }
}

/** The navigation offset a document tab was opened at, read field by field. */
function navigationOffset(params: unknown): number | undefined {
  if (typeof params !== 'object' || params === null || !('offset' in params)) return undefined
  const { offset } = params as { offset: unknown }
  return typeof offset === 'number' && Number.isInteger(offset) && offset >= 0 ? offset : undefined
}

/**
 * A Citer library document as a DSH right-sidebar tab. Reopening it scrolls to the new place;
 * deleting the document closes the tab.
 */
export function DocumentTab({ useTabInfo, useLibrary, ...props }: Omit<LibraryDocumentProps, 'documentId' | 'focus'> & {
  readonly useTabInfo: UseSidebarRightTabInfo
  readonly useLibrary: SnapshotSelectorHook<DocumentLibrarySnapshot>
}) {
  useLocale()
  const { navigation, actions } = useTabInfo().tab
  const documentId = documentIdFromAddress(navigation.address)
  const deleted = useLibrary(value => documentId !== undefined && value.deleted.includes(documentId))
  useEffect(() => { if (deleted) actions.close() }, [deleted, actions])
  const offset = navigationOffset(navigation.params)
  if (documentId === undefined || deleted) return <p className={css.state} role="alert">{t('settings.reader.missing')}</p>
  return <LibraryDocument {...props} documentId={documentId} focus={offset === undefined ? undefined : { offset, revision: navigation.revision }} />
}
