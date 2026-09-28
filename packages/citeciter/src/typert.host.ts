import type { TypertContribution } from '@deepseek-ai/dsh-typert-registry'
import {
  citeCiterRequestSchema,
  citeCiterResponseSchema,
  citationDraftSchema,
  citationRecordSchema,
  topicSnapshotSchema,
  topicSummarySchema,
} from './topic.ts'
import { updateCheckResponseSchema } from './update.ts'
import { citeCiterRequestDescriptor, updateCheckDescriptor } from './typert-common.ts'
import { namedSchema } from './typert-codec.ts'

/** Handwritten strict Host contribution matching the single Remote decorator. */
export const TYPERT = {
  package: '@kirkchinese/dsh-citeciter',
  face: 'host',
  schemas: [
    namedSchema('CitationDraft', citationDraftSchema),
    namedSchema('CitationRecord', citationRecordSchema),
    namedSchema('TopicSummary', topicSummarySchema),
    namedSchema('TopicSnapshot', topicSnapshotSchema),
    namedSchema('CiteCiterRequest', citeCiterRequestSchema),
    namedSchema('CiteCiterResponse', citeCiterResponseSchema),
    namedSchema('UpdateCheckResponse', updateCheckResponseSchema),
  ],
  model: {
    services: [],
    events: [],
    objects: [],
  },
  invocations: [citeCiterRequestDescriptor, updateCheckDescriptor],
} as const satisfies TypertContribution

export default TYPERT
