import { useEffect, useState } from 'react'
import { Button } from '@deepseek-ai/dsh-client-ui-primitives'
import type { SessionId } from '@deepseek-ai/dsh-session/types'
import type { DocumentLibraryFace, LoadedDocument } from '../document-library.ts'
import type { SelectionSurfaces } from '../wheel-gesture.ts'
import { DocumentView } from './DocumentView.tsx'
import { t, useLocale } from '../i18n.ts'
import css from './LibraryDocument.module.css'

export interface LibraryDocumentProps {
  readonly documentId: string
  readonly focus?: { readonly offset: number, readonly revision: number } | undefined
  readonly library: Pick<DocumentLibraryFace, 'load'>
  readonly registerSurface: SelectionSurfaces['register']
  /** The source conversation questions about this document belong to, when one is open. */
  readonly sourceSessionId: () => SessionId | null
}

type LoadState = { readonly status: 'loading' } | { readonly status: 'ready', readonly document: LoadedDocument } | { readonly status: 'error', readonly error: string }

/** One document of Citer's library, loaded once and read in the shared document view. */
export function LibraryDocument({ documentId, focus, library, registerSurface, sourceSessionId }: LibraryDocumentProps) {
  useLocale()
  const [state, setState] = useState<LoadState>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  useEffect(() => {
    let current = true
    setState({ status: 'loading' })
    library.load(documentId).then(
      document => { if (current) setState({ status: 'ready', document }) },
      (error: unknown) => { if (current) setState({ status: 'error', error: error instanceof Error ? error.message : String(error) }) },
    )
    return () => { current = false }
  }, [library, documentId, attempt])

  if (state.status === 'loading') return <p className={css.state} role="status">{t('settings.reader.loading')}</p>
  if (state.status === 'error') {
    // A deleted document stays deleted; other failures, such as a lost connection, may pass.
    const missing = /ENOENT|no such file/iu.test(state.error)
    return <div className={css.state} role="alert">
      <p>{missing ? t('settings.reader.missing') : state.error}</p>
      {!missing && <Button variant="outline" size="sm" onClick={() => setAttempt(value => value + 1)}>{t('settings.reader.retry')}</Button>}
    </div>
  }
  const { document } = state
  return <DocumentView
    format={document.format}
    content={document.content}
    focus={focus}
    registerSurface={registerSurface}
    toSource={(selection) => {
      const source = sourceSessionId()
      return source === null ? null : { kind: 'document', sourceSessionId: source, documentId: document.documentId, title: document.title, ...selection }
    }}
  />
}
