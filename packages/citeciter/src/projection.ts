import type { SessionEvent } from '@deepseek-ai/dsh-session'
import type { ProjectionDefinition } from '@deepseek-ai/dsh-session-projection'
import type { ZodType } from 'zod'
import {
  CITATION_CONTEXT_NAME,
  citeCiterProjectionSchema,
  parseCitationContext,
  type CiteCiterProjection,
} from './thread.ts'

const SYSTEM_PROMPT_SOURCE = '@deepseek-ai/dsh-system-prompt'
const EMPTY: CiteCiterProjection = Object.freeze({ thread: null })

/** Extract this plugin's named section from one authoritative runtime snapshot. */
function citationSection(event: SessionEvent): string | null {
  if (event.type !== 'user/message') return null
  const source = event.data.source
  if (
    source.kind !== 'plugin'
    || source.plugin !== SYSTEM_PROMPT_SOURCE
    || source.form !== 'snapshot'
  ) return null
  return source.sections.find((section) => section.name === CITATION_CONTEXT_NAME)?.text ?? null
}

/** Pure durable projection of the first Citation context in a forked child. */
export const citeCiterProjection: ProjectionDefinition<'citeciter', CiteCiterProjection> = {
  key: 'citeciter',
  schema: citeCiterProjectionSchema as ZodType<CiteCiterProjection>,
  stateVersion: 1,
  init: () => EMPTY,
  apply(state, event) {
    const text = citationSection(event)
    if (text === null) return state
    const envelope = parseCitationContext(text)
    if (envelope === null) return state
    if (state.thread !== null) return state
    return {
      thread: {
        citation: envelope.citation,
        historyStartSeq: envelope.historyStartSeq,
        contextSeq: event.seq,
      },
    }
  },
  view: (state) => state,
}
