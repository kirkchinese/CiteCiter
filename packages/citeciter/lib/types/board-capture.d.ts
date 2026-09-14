import type { Context } from '@deepseek-ai/cordis';
/** Correlates one model-requested render with one client reply; bytes become a durable DSH attachment. */
export declare class BoardCaptureBroker {
    private readonly pending;
    id(sessionId: string): string | undefined;
    reply(sessionId: string, id: string, png?: string, error?: string): void;
    dispose(): void;
    private capture;
    /** Tool returns the browser-rendered board image inside the current turn; it never starts another prompt. */
    tool(ctx: Context): import("@deepseek-ai/dsh-tools").ToolDefinition;
}
