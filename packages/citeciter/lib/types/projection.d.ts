import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection';
import { type CiteCiterProjection } from './thread.ts';
/** Pure durable projection of the first Citation context in a forked child. */
export declare const citeCiterProjection: ProjectionDefinition<'citeciter', CiteCiterProjection>;
