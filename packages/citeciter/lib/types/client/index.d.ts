/** CiteCiter browser plugin: selection → durable, isolated Citation Thread. */
import type { Context } from '@deepseek-ai/cordis';
export declare const name = "@kirkchinese/dsh-citeciter";
export declare const inject: string[];
/** Register Remote contribution, selection capture, overlay, and details panel. */
export declare function apply(ctx: Context): Promise<void>;
