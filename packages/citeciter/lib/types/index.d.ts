/**
 * Host loader entry for the browser-only CiteCiter plugin.
 * Deliberately no-op: the browser half (`./client`) owns the whole feature,
 * and the plugin registers no process-level Host service (the known
 * Cordis duplicate-service trap therefore cannot trigger).
 */
export declare const name = "@deepseek-ai/dsh-citeciter";
export declare const inject: readonly [];
export declare function apply(): void;
