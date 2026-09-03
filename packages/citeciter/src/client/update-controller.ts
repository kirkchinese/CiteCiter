import {
  type SettingsScope,
  type SnapshotStore,
} from '@deepseek-ai/dsh-client-runtime/client'
import type { CiteCiterSettings } from '../topic.ts'

const CHECK_INTERVAL_MS = 24 * 60 * 60 * 1000
const BROWSER_DISABLED_KEY = 'citeciter:update-notifications-disabled'
const DEFERRED_KEY_PREFIX = 'citeciter:update-deferred:'
type UpdateStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

/** One newer package version returned by the validated Host check. */
export interface AvailableUpdate {
  readonly currentVersion: string
  readonly latestVersion: string
}

/** Observable state shared by the update card and settings page. */
export interface UpdateNoticeSnapshot {
  available: AvailableUpdate | null
  checking: boolean
  copyStatus: 'idle' | 'copying' | 'copied' | 'error'
  copyMessage: string | null
  notificationsEnabled: boolean
  preferenceReady: boolean
  preferencePersistence: 'host' | 'browser'
  preferenceStatus: 'idle' | 'saving' | 'saved' | 'error'
  preferenceMessage: string | null
}

/** Initial root-scoped update-notice state. */
export const INITIAL_UPDATE_SNAPSHOT: UpdateNoticeSnapshot = Object.freeze({
  available: null,
  checking: false,
  copyStatus: 'idle',
  copyMessage: null,
  notificationsEnabled: true,
  preferenceReady: false,
  preferencePersistence: 'host',
  preferenceStatus: 'idle',
  preferenceMessage: null,
})

/** Browser APIs used by the update controller. */
export interface UpdateBrowserEnvironment {
  readonly document: Pick<Document, 'visibilityState' | 'addEventListener' | 'removeEventListener'>
  readonly sessionStorage: UpdateStorage
  readonly localStorage: UpdateStorage
  readonly clipboard: Pick<Clipboard, 'writeText'> | undefined
  readonly now: () => number
}

/** Operations exposed to the update notice and settings page. */
export interface UpdateController {
  getSnapshot(): UpdateNoticeSnapshot
  subscribe(listener: () => void): () => void
  start(): Promise<void>
  copyUpdateCommand(): Promise<void>
  defer(): void
  setNotificationsEnabled(enabled: boolean): Promise<boolean>
  dispose(): Promise<void>
}

/** Read a newer validated version, or null when the installed version is current. */
export type CheckUpdate = (signal: AbortSignal) => Promise<AvailableUpdate | null>

const UNAVAILABLE_STORAGE = Object.freeze({
  getItem: (_key: string): string | null => null,
  setItem: (_key: string, _value: string): void => undefined,
  removeItem: (_key: string): void => undefined,
})

function readBrowserStorage(read: () => Storage): UpdateStorage {
  try {
    return read()
  } catch {
    // Accessing the storage property itself can throw under browser privacy policies.
    return UNAVAILABLE_STORAGE
  }
}

/** @returns browser services without letting denied storage or clipboard getters break plugin mount. */
export function createUpdateBrowserEnvironment(): UpdateBrowserEnvironment {
  let clipboard: Pick<Clipboard, 'writeText'> | undefined
  try {
    clipboard = typeof navigator === 'undefined' ? undefined : navigator.clipboard
  } catch {
    // A denied clipboard getter is represented as unavailable and reported only after user action.
    clipboard = undefined
  }
  return {
    document,
    sessionStorage: readBrowserStorage(() => sessionStorage),
    localStorage: readBrowserStorage(() => localStorage),
    clipboard,
    now: Date.now,
  }
}

function updateCommand(version: string): string {
  return `dsh plugin --profile web add @kirkchinese/dsh-citeciter@${version}`
}

function deferredKey(version: string): string {
  return DEFERRED_KEY_PREFIX + version
}

function storageHas(storage: Pick<Storage, 'getItem'>, key: string): boolean {
  try {
    return storage.getItem(key) === '1'
  } catch {
    // Browser privacy settings may deny storage; the controller keeps a page-local fallback.
    return false
  }
}

function writeBrowserPreference(
  storage: UpdateStorage,
  enabled: boolean,
): boolean {
  try {
    if (enabled) storage.removeItem(BROWSER_DISABLED_KEY)
    else storage.setItem(BROWSER_DISABLED_KEY, '1')
    return (storage.getItem(BROWSER_DISABLED_KEY) === '1') !== enabled
  } catch {
    // The caller keeps the control visible and reports that browser persistence failed.
    return false
  }
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

/**
 * Own update discovery, deferral, copy feedback, and preference persistence.
 * @param settings - existing CiteCiter settings namespace scope.
 * @param checkUpdate - validated Host version check; it never installs software.
 * @param store - root-scoped observable state owned by the client runtime.
 * @param environment - browser APIs, injectable for deterministic tests.
 * @param reportCheckError - diagnostic sink for silent automatic-check failures.
 * @returns the root-scoped update controller.
 */
export function createUpdateController(
  settings: SettingsScope<CiteCiterSettings>,
  checkUpdate: CheckUpdate,
  store: SnapshotStore<UpdateNoticeSnapshot>,
  environment: UpdateBrowserEnvironment = createUpdateBrowserEnvironment(),
  reportCheckError: (error: unknown) => void = () => undefined,
): UpdateController {
  let disposed = false
  let started = false
  let lastCheckAt: number | null = null
  let activeCheck: AbortController | null = null
  let checkOperation: Promise<void> | null = null
  let copyOperation: Promise<void> | null = null
  let preferenceOperation: Promise<boolean> | null = null
  const operations = new Set<Promise<unknown>>()
  const memoryDeferred = new Set<string>()

  const track = <Value>(operation: Promise<Value>): Promise<Value> => {
    let tracked: Promise<Value>
    tracked = operation.finally(() => operations.delete(tracked))
    operations.add(tracked)
    return tracked
  }

  const readPreference = () => {
    const snapshot = settings.getSnapshot()
    const browser = snapshot.mode === 'memory'
    return {
      ready: browser || snapshot.status !== 'loading',
      enabled: browser
        ? !storageHas(environment.localStorage, BROWSER_DISABLED_KEY)
        : snapshot.value?.updateNotifications !== false,
      persistence: browser ? 'browser' as const : 'host' as const,
    }
  }

  const publishPreference = () => {
    const preference = readPreference()
    store.update((state) => {
      state.notificationsEnabled = preference.enabled
      state.preferenceReady = preference.ready
      state.preferencePersistence = preference.persistence
      if (!preference.enabled) {
        state.available = null
        state.copyStatus = 'idle'
        state.copyMessage = null
      }
    })
    if (!preference.enabled) activeCheck?.abort()
    return preference
  }

  const report = (error: unknown) => {
    try {
      reportCheckError(error)
    } catch {
      // A diagnostic callback cannot break the update lifecycle.
    }
  }

  const runCheck = async (force = false): Promise<void> => {
    if (disposed || checkOperation !== null) return checkOperation ?? Promise.resolve()
    const preference = publishPreference()
    if (!preference.ready || !preference.enabled) return
    const now = environment.now()
    if (!force && lastCheckAt !== null && now - lastCheckAt < CHECK_INTERVAL_MS) return
    lastCheckAt = now
    const abort = new AbortController()
    activeCheck = abort
    store.update((state) => {
      state.checking = true
    })
    const operation = (async () => {
      try {
        const available = await checkUpdate(abort.signal)
        if (disposed || abort.signal.aborted || activeCheck !== abort || !readPreference().enabled) return
        const deferred = available !== null && (
          memoryDeferred.has(available.latestVersion)
          || storageHas(environment.sessionStorage, deferredKey(available.latestVersion))
        )
        store.update((state) => {
          state.available = deferred ? null : available
          state.copyStatus = 'idle'
          state.copyMessage = null
        })
      } catch (error) {
        if (!disposed && !abort.signal.aborted && !isAbortError(error)) report(error)
      } finally {
        if (activeCheck === abort) activeCheck = null
        if (!disposed) store.update((state) => {
          state.checking = false
        })
      }
    })()
    checkOperation = track(operation).finally(() => {
      checkOperation = null
    })
    return checkOperation
  }

  const onSettingsChange = () => {
    const previous = store.getSnapshot()
    const preference = publishPreference()
    if (!started || !preference.ready || !preference.enabled) return
    if (!previous.preferenceReady || !previous.notificationsEnabled) void runCheck(true)
  }
  const unsubscribeSettings = settings.subscribe(onSettingsChange)
  publishPreference()

  const onVisibilityChange = () => {
    if (environment.document.visibilityState === 'visible') void runCheck()
  }

  return {
    getSnapshot: store.getSnapshot,
    subscribe: store.subscribe,
    start: async () => {
      if (disposed || started) return
      started = true
      environment.document.addEventListener('visibilitychange', onVisibilityChange)
      await runCheck()
    },
    copyUpdateCommand: async () => {
      const available = store.getSnapshot().available
      if (disposed || available === null || copyOperation !== null) return copyOperation ?? Promise.resolve()
      store.update((state) => {
        state.copyStatus = 'copying'
        state.copyMessage = '正在复制更新命令…'
      })
      const operation = (async () => {
        try {
          if (environment.clipboard === undefined) throw new Error('clipboard unavailable')
          await environment.clipboard.writeText(updateCommand(available.latestVersion))
          if (!disposed) store.update((state) => {
            state.copyStatus = 'copied'
            state.copyMessage = '更新命令已复制。运行后请重启 DSH Web。'
          })
        } catch {
          if (!disposed) store.update((state) => {
            state.copyStatus = 'error'
            state.copyMessage = '无法自动复制，请手动复制下方命令。运行后请重启 DSH Web。'
          })
        }
      })()
      copyOperation = track(operation).finally(() => {
        copyOperation = null
      })
      return copyOperation
    },
    defer: () => {
      const available = store.getSnapshot().available
      if (disposed || available === null) return
      memoryDeferred.add(available.latestVersion)
      try {
        environment.sessionStorage.setItem(deferredKey(available.latestVersion), '1')
      } catch {
        // Page-local deferral still prevents repeated prompts when storage is unavailable.
      }
      store.update((state) => {
        state.available = null
        state.copyStatus = 'idle'
        state.copyMessage = null
      })
    },
    setNotificationsEnabled: async (enabled) => {
      if (disposed || preferenceOperation !== null) return preferenceOperation ?? false
      store.update((state) => {
        state.preferenceStatus = 'saving'
        state.preferenceMessage = enabled ? '正在开启更新提醒…' : '正在关闭更新提醒…'
      })
      const operation = (async (): Promise<boolean> => {
        const persistence = readPreference().persistence
        let saved = false
        try {
          if (persistence === 'browser') {
            saved = writeBrowserPreference(environment.localStorage, enabled)
          } else {
            await settings.set('updateNotifications', enabled)
            saved = settings.getSnapshot().value?.updateNotifications === enabled
          }
        } catch {
          saved = false
        }
        if (disposed) return false
        publishPreference()
        if (!saved) {
          store.update((state) => {
            state.preferenceStatus = 'error'
            state.preferenceMessage = persistence === 'browser'
              ? '浏览器阻止了本地存储，无法保存更新提醒设置。'
              : '无法保存更新提醒设置，请重试。'
          })
          return false
        }
        store.update((state) => {
          state.preferenceStatus = 'saved'
          state.preferenceMessage = enabled ? '已开启版本更新提醒' : '已关闭版本更新提醒'
          if (!enabled) state.available = null
        })
        if (enabled) void runCheck(true)
        return true
      })()
      preferenceOperation = track(operation).finally(() => {
        preferenceOperation = null
      })
      return preferenceOperation
    },
    dispose: async () => {
      if (disposed) return
      disposed = true
      activeCheck?.abort()
      activeCheck = null
      unsubscribeSettings()
      if (started) environment.document.removeEventListener('visibilitychange', onVisibilityChange)
      started = false
      while (operations.size > 0) await Promise.allSettled([...operations])
    },
  }
}

/** @param version - validated latest package version. @returns the command shown and copied by the Web notice. */
export function citeCiterUpdateCommand(version: string): string {
  return updateCommand(version)
}
