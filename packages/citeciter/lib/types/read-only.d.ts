import type { Agent } from '@deepseek-ai/dsh-agent';
export type ReadOnlyCommandStatus = {
    readonly kind: 'pending';
} | {
    readonly kind: 'ready';
} | {
    readonly kind: 'error';
    readonly message: string;
};
/** Fold the latest child-owned permission lifecycle and current sandbox state. */
export declare function readOnlyCommandStatus(agent: Agent): ReadOnlyCommandStatus;
/** Wait for durable command settlement instead of treating admission as success. */
export declare function requireReadOnlyCommand(agent: Agent, timeoutMs?: number): Promise<void>;
