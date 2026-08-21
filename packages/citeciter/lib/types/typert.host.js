import { citeCiterRequestSchema, citeCiterResponseSchema, citationDraftSchema, citationRecordSchema, topicSnapshotSchema, topicSummarySchema, } from "./topic.js";
import { citeCiterRequestDescriptor } from "./typert-common.js";
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
    ],
    model: {
        services: [],
        events: [],
        objects: [],
    },
    invocations: [citeCiterRequestDescriptor],
};
export default TYPERT;
