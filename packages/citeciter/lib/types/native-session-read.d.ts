import type { Agent } from '@deepseek-ai/dsh-agent';
import type { NativeState } from './native-session-contract.ts';
/** Read native inbox occurrences and requested admission receipts without registering a Host list row. */
export declare function readNativeState(agent: Agent, requestIds: readonly string[]): NativeState;
