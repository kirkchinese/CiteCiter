import type { Context } from '@deepseek-ai/cordis';
import type z from '@deepseek-ai/schemastery';
import { type CiteCiterSettings } from './topic.ts';
/** The 0.1.7 Cordis configuration reader. Old hosts pass no reader. */
export interface SettingsReader {
    get(): unknown;
}
/** Choose the schema mode without importing a Cordis export absent in Desktop's SDK. */
export declare function settingsConfig(schema: z<object>): z<object>;
/** Bind settings through the public contract of the installed host; registrations belong to ctx. */
export declare function bindHostSettings(ctx: Context, schema: z<object>, config?: SettingsReader): () => CiteCiterSettings;
