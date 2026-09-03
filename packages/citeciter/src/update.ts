/** Bounded, read-only npm update check for the Web plugin. */
import { z } from 'zod'

/** Fixed registry document used to resolve the installable `latest` version. */
export const CITECITER_NPM_LATEST_URL = 'https://registry.npmjs.org/@kirkchinese%2fdsh-citeciter/latest' as const
/** Successful checks remain fresh for six hours in one Host process. */
export const UPDATE_CHECK_TTL_MS = 6 * 60 * 60 * 1_000

const UPDATE_CHECK_TIMEOUT_MS = 5_000
const UPDATE_RESPONSE_MAX_BYTES = 64 * 1_024

const stableVersionPattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/u

function stableVersionParts(version: string): readonly [number, number, number] | null {
  const match = stableVersionPattern.exec(version)
  if (match === null) return null
  const parts = match.slice(1).map(Number)
  if (parts.length !== 3 || parts.some((part) => !Number.isSafeInteger(part))) return null
  return [parts[0]!, parts[1]!, parts[2]!]
}

const stableVersionSchema = z.string().refine(
  (version) => stableVersionParts(version) !== null,
  'expected a stable MAJOR.MINOR.PATCH version with safe integer components',
)

/** Stable failure identifiers consumed by the Web settings and notification UI. */
export const updateCheckErrorCodeSchema = z.enum([
  'installed-version-invalid',
  'registry-timeout',
  'registry-network',
  'registry-http',
  'registry-response-too-large',
  'registry-response-invalid',
  'registry-version-invalid',
])

/** Failure identifier returned instead of exposing transport-specific messages. */
export type UpdateCheckErrorCode = z.infer<typeof updateCheckErrorCodeSchema>

/** Strict result of one read-only npm `latest` check. */
export const updateCheckResponseSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('success'),
    installedVersion: stableVersionSchema,
    latestVersion: stableVersionSchema,
    updateAvailable: z.boolean(),
    checkedAt: z.number().int().nonnegative(),
  }).strict(),
  z.object({
    kind: z.literal('error'),
    code: updateCheckErrorCodeSchema,
    checkedAt: z.number().int().nonnegative(),
  }).strict(),
])

/** Browser-facing update result; this operation never installs or restarts anything. */
export type UpdateCheckResponse = z.infer<typeof updateCheckResponseSchema>

const registryLatestSchema = z.object({ version: z.string() }).passthrough()

class UpdateFailure extends Error {
  constructor(readonly code: UpdateCheckErrorCode) {
    super(code)
  }
}

async function readInstalledVersion(): Promise<string> {
  const [{ readFile }, { createRequire }] = await Promise.all([
    import('node:fs/promises'),
    import('node:module'),
  ])
  const packageManifestPath = createRequire(import.meta.url).resolve('@kirkchinese/dsh-citeciter/package.json')
  const raw = await readFile(packageManifestPath, 'utf8')
  const parsed: unknown = JSON.parse(raw)
  return z.object({ version: z.string() }).passthrough().parse(parsed).version
}

async function cancelReader(reader: ReadableStreamDefaultReader<Uint8Array>): Promise<void> {
  try {
    await reader.cancel()
  } catch {
    // The reader is already errored; preserve the response-size classification.
  }
}

async function cancelResponseBody(response: Response): Promise<void> {
  try {
    await response.body?.cancel()
  } catch {
    // The transport already closed the response; preserve the original classification.
  }
}

async function readBoundedText(response: Response, signal: AbortSignal): Promise<string> {
  const declaredLength = response.headers.get('content-length')
  if (declaredLength !== null && /^\d+$/u.test(declaredLength) && Number(declaredLength) > UPDATE_RESPONSE_MAX_BYTES) {
    await cancelResponseBody(response)
    throw new UpdateFailure('registry-response-too-large')
  }
  if (response.body === null) return ''

  const reader = response.body.getReader()
  const decoder = new TextDecoder()
  let received = 0
  let text = ''
  while (true) {
    signal.throwIfAborted()
    const chunk = await reader.read()
    if (chunk.done) break
    received += chunk.value.byteLength
    if (received > UPDATE_RESPONSE_MAX_BYTES) {
      await cancelReader(reader)
      throw new UpdateFailure('registry-response-too-large')
    }
    text += decoder.decode(chunk.value, { stream: true })
  }
  return text + decoder.decode()
}

/**
 * Compare stable versions without accepting prerelease or build suffixes.
 * @param left - first candidate version.
 * @param right - second candidate version.
 * @returns negative, zero, or positive for valid versions; otherwise `null`.
 */
export function compareStableVersions(left: string, right: string): -1 | 0 | 1 | null {
  const leftParts = stableVersionParts(left)
  const rightParts = stableVersionParts(right)
  if (leftParts === null || rightParts === null) return null
  for (let index = 0; index < leftParts.length; index += 1) {
    if (leftParts[index]! < rightParts[index]!) return -1
    if (leftParts[index]! > rightParts[index]!) return 1
  }
  return 0
}

/** Per-Host update checker with bounded I/O and a successful-result TTL cache. */
export class UpdateChecker {
  private cached: { readonly expiresAt: number, readonly response: UpdateCheckResponse } | undefined
  private inFlight: Promise<UpdateCheckResponse> | undefined

  /**
   * @param fetchImpl - HTTPS transport; injectable for deterministic tests.
   * @param now - wall-clock provider used for response timestamps and cache expiry.
   * @param installedVersion - installed package-version reader.
   */
  constructor(
    private readonly fetchImpl: typeof globalThis.fetch = globalThis.fetch,
    private readonly now: () => number = Date.now,
    private readonly installedVersion: () => Promise<string> = readInstalledVersion,
  ) {}

  /**
   * Read npm's installable latest version without mutating the installation.
   * @param callerSignal - Remote caller cancellation.
   * @returns a strict success or stable classified failure.
   */
  async check(callerSignal: AbortSignal): Promise<UpdateCheckResponse> {
    callerSignal.throwIfAborted()
    const now = this.now()
    if (this.cached !== undefined && now < this.cached.expiresAt) return this.cached.response

    if (this.inFlight === undefined) {
      const operation = this.checkFresh().finally(() => {
        if (this.inFlight === operation) this.inFlight = undefined
      })
      this.inFlight = operation
    }
    return waitForCaller(this.inFlight, callerSignal)
  }

  private async checkFresh(): Promise<UpdateCheckResponse> {

    let installedVersion: string
    try {
      installedVersion = await this.installedVersion()
    } catch {
      return { kind: 'error', code: 'installed-version-invalid', checkedAt: this.now() }
    }
    if (stableVersionParts(installedVersion) === null) {
      return { kind: 'error', code: 'installed-version-invalid', checkedAt: this.now() }
    }

    const timeoutSignal = AbortSignal.timeout(UPDATE_CHECK_TIMEOUT_MS)
    const signal = timeoutSignal
    try {
      const response = await this.fetchImpl(CITECITER_NPM_LATEST_URL, {
        method: 'GET',
        headers: { accept: 'application/json' },
        redirect: 'error',
        signal,
      })
      if (!response.ok) {
        await cancelResponseBody(response)
        return { kind: 'error', code: 'registry-http', checkedAt: this.now() }
      }

      const text = await readBoundedText(response, signal)
      let raw: unknown
      try {
        raw = JSON.parse(text)
      } catch {
        return { kind: 'error', code: 'registry-response-invalid', checkedAt: this.now() }
      }
      const latest = registryLatestSchema.safeParse(raw)
      if (!latest.success) return { kind: 'error', code: 'registry-response-invalid', checkedAt: this.now() }
      const comparison = compareStableVersions(installedVersion, latest.data.version)
      if (comparison === null) return { kind: 'error', code: 'registry-version-invalid', checkedAt: this.now() }

      const checkedAt = this.now()
      const result: UpdateCheckResponse = {
        kind: 'success',
        installedVersion,
        latestVersion: latest.data.version,
        updateAvailable: comparison < 0,
        checkedAt,
      }
      this.cached = { expiresAt: checkedAt + UPDATE_CHECK_TTL_MS, response: result }
      return result
    } catch (error) {
      if (timeoutSignal.aborted) return { kind: 'error', code: 'registry-timeout', checkedAt: this.now() }
      if (error instanceof UpdateFailure) return { kind: 'error', code: error.code, checkedAt: this.now() }
      return { kind: 'error', code: 'registry-network', checkedAt: this.now() }
    }
  }
}

function waitForCaller(
  operation: Promise<UpdateCheckResponse>,
  signal: AbortSignal,
): Promise<UpdateCheckResponse> {
  signal.throwIfAborted()
  return new Promise((resolve, reject) => {
    const onAbort = () => reject(signal.reason)
    signal.addEventListener('abort', onAbort, { once: true })
    void operation.then(resolve, reject).finally(() => {
      signal.removeEventListener('abort', onAbort)
    })
  })
}
