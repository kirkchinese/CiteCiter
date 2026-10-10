import type { Session } from '@deepseek-ai/dsh-session';
/**
 * Resolve one document from durable user submissions. Draft metadata grants no access.
 * @param session - the Topic Session whose committed user messages carry document addresses.
 * @param requested - explicit documentId; optional when exactly one document was sent.
 * @returns the readable documentId.
 */
export declare function resolveReadableDocument(session: Session | undefined, requested?: string): string;
