import type { TopicScenario } from '../topic.ts'
import type { CiteSelection } from './types.ts'

export type CreateMode = 'observer' | 'exact-fork' | 'exact-when-available'

export interface RequestIntent {
  readonly key: string
  readonly requestId: string
}

const STORAGE_PREFIX = 'citeciter:pending-request:'
const memoryIntents = new Map<string, string>()

function stableFallbackIntentKey(identity: string): string {
  let hash = 2166136261
  for (const byte of new TextEncoder().encode(identity)) {
    hash ^= byte
    hash = Math.imul(hash, 16777619)
  }
  return `${(hash >>> 0).toString(16).padStart(8, '0')}-${identity.length.toString(16)}`
}

async function requestIntentKey(identity: string): Promise<string> {
  try {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(identity))
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    return stableFallbackIntentKey(identity)
  }
}

async function claimRequestIntent(namespace: string, identity: string): Promise<RequestIntent> {
  const key = `${namespace}:${await requestIntentKey(identity)}`
  const storageKey = STORAGE_PREFIX + key
  let stored: string | null = null
  let persistent = false
  try {
    stored = sessionStorage.getItem(storageKey) ?? memoryIntents.get(key) ?? null
    persistent = true
  } catch {
    stored = memoryIntents.get(key) ?? null
  }
  if (stored !== null && stored.startsWith('topic-')) return { key, requestId: stored }
  const fallback = `topic-${key}`
  let requestId = fallback
  try {
    requestId = `topic-${globalThis.crypto.randomUUID()}`
  } catch {
    // A deterministic ID still protects retries in browsers without Web Crypto.
  }
  if (persistent) {
    try {
      sessionStorage.setItem(storageKey, requestId)
    } catch {
      memoryIntents.set(key, requestId)
    }
  } else {
    memoryIntents.set(key, requestId)
  }
  return { key, requestId }
}

/**
 * Claim the retry-stable request ID for one pending Topic-creation intent.
 * @param selection - cited source selection.
 * @param question - normalized first question.
 * @param mode - resolved Topic creation mode.
 * @returns the pending intent key and request ID.
 */
export function claimCreateTopicIntent(
  selection: CiteSelection,
  question: string,
  mode: CreateMode,
  scenario: TopicScenario = 'qa',
): Promise<RequestIntent> {
  const identity = selection.kind === 'assistant-step'
    ? [
        selection.sourceSessionId,
        selection.anchorKey,
        selection.startOffset,
        selection.endOffset,
        selection.sourceHintText ?? null,
        selection.prefixText,
        selection.suffixText,
      ]
    : [
        selection.sourceSessionId,
        selection.callId,
        selection.projection,
        selection.anchorKey,
      ]
  return claimRequestIntent('create', JSON.stringify([
    ...identity,
    selection.displayText,
    question,
    mode,
    scenario,
  ]))
}

/**
 * Claim the retry-stable request ID for one uncited Topic creation.
 * @param sourceSessionId - owning DSH Session.
 * @param question - normalized first question.
 * @param scenario - requested Topic presentation.
 * @returns the pending intent key and request ID.
 */
export function claimCreateFreeTopicIntent(
  sourceSessionId: string,
  question: string,
  scenario: Extract<TopicScenario, 'qa' | 'present'>,
): Promise<RequestIntent> {
  return claimRequestIntent('create-free', JSON.stringify([sourceSessionId, question, scenario]))
}

/** Document-range claim identity shared by the Reader entry point. */
export interface DocumentClaimIntent {
  readonly documentId: string
  readonly displayText: string
  readonly prefixText: string
  readonly suffixText: string
}

/**
 * Claim the retry-stable request ID for one pending document Topic creation.
 * @param claim - document identity and verified-looking quote context.
 * @param question - normalized first question.
 * @returns the pending intent key and request ID.
 */
export function claimCreateDocumentIntent(
  claim: DocumentClaimIntent,
  question: string,
): Promise<RequestIntent> {
  return claimRequestIntent('create', JSON.stringify([
    claim.documentId,
    claim.displayText,
    claim.prefixText,
    claim.suffixText,
    question,
  ]))
}

/**
 * Claim the retry-stable request ID for one pending Topic follow-up.
 * @param topicSessionId - target private Topic Session.
 * @param question - normalized follow-up question.
 * @returns the pending intent key and request ID.
 */
export function claimAskIntent(
  topicSessionId: string,
  question: string,
): Promise<RequestIntent> {
  return claimRequestIntent('ask', JSON.stringify([topicSessionId, question]))
}

/**
 * Forget a confirmed request so a later identical submission is a new user intent.
 * @param intent - confirmed pending intent.
 */
export function completeRequestIntent(intent: RequestIntent): void {
  memoryIntents.delete(intent.key)
  try {
    const storageKey = STORAGE_PREFIX + intent.key
    if (sessionStorage.getItem(storageKey) === intent.requestId) sessionStorage.removeItem(storageKey)
  } catch {
    // Browser storage was unavailable; the page-local entry was already removed.
  }
}
