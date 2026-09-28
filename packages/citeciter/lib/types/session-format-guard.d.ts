export declare class NewerSessionFormatError extends Error {
}
/** Refuse stale writable fallback when a newer host has already produced a successor log. Never migrate logs here. */
export declare function assertSessionFormat(directory: string): Promise<void>;
/** Inspect only the exact owned Topic identity beneath the persistence workspace level. */
export declare function assertOwnedSessionFormat(root: string, sessionId: string): Promise<void>;
