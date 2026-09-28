import type { Session } from '@deepseek-ai/dsh-session';
/** Resolve one document from durable user submissions. Draft metadata grants no native Topic access. */
export declare function resolveReadableDocument(session: Session | undefined, hosted: boolean, initial: string | null, requested?: string): string;
