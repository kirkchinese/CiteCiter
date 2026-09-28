import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import type { BoardSnapshot } from './board.ts';
import type { BoardCaptureJob } from './board-capture-protocol.ts';
/** Correlates one model-requested render with one client reply; bytes become a durable DSH attachment. */
export declare class BoardCaptureBroker {
    private readonly pending;
    id(sessionId: string): string | undefined;
    /** Only live capture requests are advertised; polling does not load or resume other Topics. */
    jobs(): BoardCaptureJob[];
    reply(sessionId: string, id: string, png?: string, error?: string): void;
    dispose(): void;
    private capture;
    /** Tool returns the browser-rendered board image inside the current turn; it never starts another prompt. */
    tool(ctx: Context, readBoard: (agent: Agent) => BoardSnapshot): import("@deepseek-ai/dsh-tools").ToolDefinition;
}
