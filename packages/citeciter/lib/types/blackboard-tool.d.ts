/**
 * Create the blackboard_apply tool. A successful call only validates and records the batch;
 * the board itself is replayed from committed results.
 * @returns a tool definition for one Topic tool registry.
 */
export declare function createBlackboardApplyTool(): import("@deepseek-ai/dsh-tools").ToolDefinition;
