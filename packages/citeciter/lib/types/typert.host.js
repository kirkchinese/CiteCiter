import { citeCiterRequestSchema, citeCiterResponseSchema, citationDraftSchema, citationRecordSchema, topicSnapshotSchema, topicSummarySchema, } from "./topic.js";
import { updateCheckResponseSchema } from "./update.js";
import { citeCiterRequestDescriptor, updateCheckDescriptor } from "./typert-common.js";
import { namedSchema } from "./typert-codec.js";
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
};
export default TYPERT;
