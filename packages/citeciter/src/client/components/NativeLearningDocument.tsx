import { useMemo } from 'react'
import type { DocumentPreviewProps } from '@deepseek-ai/dsh-client-ui-sidebar-documentpreview/client'
import type { ActionSource } from '../action-controller.ts'
import type { SelectionSurfaces } from '../wheel-gesture.ts'
import { decodeNativeText, nativeDocumentSource } from '../native-document.ts'
import { DocumentView } from './DocumentView.tsx'
import { t, useLocale } from '../i18n.ts'
import css from './LibraryDocument.module.css'

export interface LearningDocumentActions {
  readonly registerSurface: SelectionSurfaces['register']
  readonly openActions: (source: ActionSource, x: number, y: number) => void
}

/**
 * Citer's reading view of a workspace file, offered by DSH's file preview next to its own views.
 * DSH owns loading, reload and file navigation; Citer renders the text like a library document.
 */
export function NativeLearningDocument({ content, resourceAddress, wrap, scrollportRef, registerSurface }: DocumentPreviewProps & LearningDocumentActions) {
  const localeRevision = useLocale()
  const decoded = useMemo(() => {
    try { return { text: decodeNativeText(content), error: null } }
    catch (error) { return { text: '', error: error instanceof Error ? error.message : String(error) } }
  }, [content, localeRevision])
  const format = /\.(md|markdown)$/iu.test(resourceAddress) ? 'markdown' : 'text'
  if (decoded.error !== null) return <p className={css.state} role="alert">{decoded.error}</p>
  return <DocumentView
    format={format}
    content={decoded.text}
    wrap={wrap}
    note={t('settings.native.snapshot')}
    scrollRef={scrollportRef}
    registerSurface={registerSurface}
    toSource={(selection) => {
      try { return nativeDocumentSource(resourceAddress, decoded.text, selection) }
      // The address names no Session, so there is no source conversation to ask in.
      catch { return null }
    }}
  />
}
