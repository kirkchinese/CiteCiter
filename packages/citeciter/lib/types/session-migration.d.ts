import type { Context } from '@deepseek-ai/cordis';
/** Copy a validated Session through public persistence handles. Resume an interrupted identical prefix; never overwrite divergent data or remove the original. Close both handles before returning. */
export declare function copySessionHistory(source: Context['sessionPersistence'], target: Context['sessionPersistence'], sessionId: string): Promise<void>;
