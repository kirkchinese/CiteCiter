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

/** Handwritten strict Host contribution matching the single Remote decorator. */
export const TYPERT = {
  package: '@kirkchinese/dsh-citeciter',
  face: 'host',
  schemas: [
    { name: 'CitationDraft', schema: citationDraftSchema },
    { name: 'CitationRecord', schema: citationRecordSchema },
    { name: 'TopicSummary', schema: topicSummarySchema },
    { name: 'TopicSnapshot', schema: topicSnapshotSchema },
    { name: 'CiteCiterRequest', schema: citeCiterRequestSchema },
    { name: 'CiteCiterResponse', schema: citeCiterResponseSchema },
    { name: 'UpdateCheckResponse', schema: updateCheckResponseSchema },
  ],
  model: {
    services: [],
    events: [],
    objects: [],
  },
  invocations: [citeCiterRequestDescriptor, updateCheckDescriptor],
} as const

export default TYPERT
