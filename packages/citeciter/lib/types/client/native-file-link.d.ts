/** Open a file in DSH's right sidebar, the way the host's own tool rows and file links do. */
import type { Context } from '@deepseek-ai/cordis';
/** Open one path of a source Session's workspace; false when the host has no right sidebar. */
export type FileOpener = (sessionId: string, path: string, line?: number) => boolean;
/**
 * Follow the optional right-sidebar service for the lifetime of `ctx`.
 * @param ctx - Client context; the sidebar may be absent or come and go with its plugin.
 * @returns an opener that resolves paths against the source Session's workspace root.
 */
export declare function createFileOpener(ctx: Context): FileOpener;
