/**
 * Citer's Chinese and English dictionaries, one module per interface area. Chinese is the key-set
 * source of truth; every English dictionary must cover exactly the same keys.
 */
import * as board from './board.ts'
import * as common from './common.ts'
import * as panel from './panel.ts'
import * as settings from './settings.ts'
import * as transcript from './transcript.ts'

export const zh = { ...common.zh, ...panel.zh, ...transcript.zh, ...settings.zh, ...board.zh }

/** Every interface text key. */
export type CiterKey = keyof typeof zh

export const en: Record<CiterKey, string> = { ...common.en, ...panel.en, ...transcript.en, ...settings.en, ...board.en }
