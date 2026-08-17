/**
 * Host loader entry for the browser-only CiteCiter plugin.
 * Deliberately no-op: the browser half (`./client`) owns the whole feature,
 * and the plugin registers no process-level Host service (the known
 * Cordis duplicate-service trap therefore cannot trigger).
 */
/** Cordis plugin identity shared with the browser bundle. */
export const name = '@kirkchinese/dsh-citeciter'

/** CiteCiter has no Host service dependencies. */
export const inject = [] as const

/** Register no Host effects; all behavior belongs to the browser plugin. */
export function apply(): void {}
