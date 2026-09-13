import { useEffect, useRef, useState } from 'react'
import type { NativeComposer } from './native-composer.ts'

/**
 * Download one committed attachment on demand through its owning Session.
 * @param sessionId - the exact Topic that authorizes the attachment read.
 * @param id - the durable native attachment identity.
 * @param name - suggested local filename; never used as a source filesystem path.
 * @param load - native attachment reader, provided by the client controller.
 * @returns the download action and its visible progress/error state.
 * Repeated clicks share one request. Identity changes and unmount cancel UI effects
 * and release the owned object URL without cancelling the host's shared reader.
 */
export function useFileDownload(sessionId: string, id: string, name: string, load: NativeComposer['attachment']) {
  const requestRef = useRef<{ active: boolean, pending: boolean, url?: string }>()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string>()
  useEffect(() => {
    const request: NonNullable<typeof requestRef.current> = { active: true, pending: false }
    requestRef.current = request
    setBusy(false); setError(undefined)
    return () => {
      request.active = false
      if (request.url !== undefined) URL.revokeObjectURL(request.url)
    }
  }, [sessionId, id, name, load])

  const download = async () => {
    const request = requestRef.current
    if (request === undefined || !request.active || request.pending) return
    request.pending = true
    setBusy(true); setError(undefined)
    try {
      if (request.url === undefined) {
        const blob = await load(sessionId, id)
        if (!request.active) return
        request.url = URL.createObjectURL(blob)
      }
      const link = document.createElement('a')
      link.href = request.url
      link.download = name
      link.hidden = true
      document.body.append(link)
      try { link.click() } finally { link.remove() }
    } catch (reason) {
      if (request.active) setError(reason instanceof Error ? reason.message : String(reason))
    } finally {
      request.pending = false
      if (request.active) setBusy(false)
    }
  }
  return { download, busy, error }
}
