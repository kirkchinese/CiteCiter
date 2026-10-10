import type { Context } from '@deepseek-ai/cordis';
import type z from '@deepseek-ai/schemastery';
import { type CiteCiterSettings } from './topic.ts';
/** Official DSH supplies a live Cordis configuration reader. */
export interface SettingsReader {
    get(): unknown;
}
/** Keep settings live through the official Cordis configuration contract. */
export declare function settingsConfig(schema: z<object>): z<object, object, "volatile">;
/** Bind settings to their owning plugin; registrations are released with ctx. */
export declare function bindHostSettings(ctx: Context, config: SettingsReader): () => CiteCiterSettings;
