/**
 * Create the blackboard_animate tool. A successful call validates the timeline against the current
 * board and records it; the board keeps one timeline, replaced by the next successful call.
 * @returns a tool definition for one Topic tool registry.
 */
export declare function createBlackboardAnimateTool(): import("@deepseek-ai/dsh-tools").ToolDefinition;
/**
 * Create the blackboard_apply tool. A successful call only validates and records the batch;
 * the board itself is replayed from committed results.
 * @returns a tool definition for one Topic tool registry.
 */
export declare function createBlackboardApplyTool(): import("@deepseek-ai/dsh-tools").ToolDefinition;
