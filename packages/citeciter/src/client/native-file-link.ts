/** Open a file in DSH's right sidebar, the way the host's own tool rows and file links do. */
import type { Context } from '@deepseek-ai/cordis'
import { sessionFileAddress } from '@deepseek-ai/dsh-util-workspace-path'

/** The part of DSH's `sidebarRight` service Citer uses; the sidebar package is not a Citer dependency. */
interface SidebarNavigation {
  openResource(address: string, options?: { readonly params?: { readonly line?: number } }): void
}

/** Open one path of a source Session's workspace; false when the host has no right sidebar. */
export type FileOpener = (sessionId: string, path: string, line?: number) => boolean

/**
 * Follow the optional right-sidebar service for the lifetime of `ctx`.
 * @param ctx - Client context; the sidebar may be absent or come and go with its plugin.
 * @returns an opener that resolves paths against the source Session's workspace root.
 */
export function createFileOpener(ctx: Context): FileOpener {
  let sidebar: SidebarNavigation | undefined
  ctx.inject(['sidebarRight'], (sidebarCtx) => {
    const service = (sidebarCtx as unknown as { readonly sidebarRight?: Partial<SidebarNavigation> }).sidebarRight
    if (typeof service?.openResource !== 'function') return
    sidebar = service as SidebarNavigation
    sidebarCtx.effect(() => () => { sidebar = undefined }, 'citeciter: right sidebar file links')
  })
  return (sessionId, path, line) => {
    if (sidebar === undefined || path.trim() === '') return false
    try {
      sidebar.openResource(sessionFileAddress(sessionId, path), line === undefined ? undefined : { params: { line } })
      return true
    } catch (error) {
      // No sidebar type claims this address on this host; the row stays usable without the link.
      ctx.logger.warn('Citer could not open a file in the right sidebar', error)
      return false
    }
  }
}
