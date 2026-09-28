import { C as topicSummarySchema, S as topicSnapshotSchema, f as citeCiterRequestSchema, l as citationDraftSchema, p as citeCiterResponseSchema, r as updateCheckResponseSchema, u as citationRecordSchema } from "./update-CRD1jFLf.js";
import { n as updateCheckDescriptor, r as namedSchema, t as citeCiterRequestDescriptor } from "./typert-common-BQpqe5Ph.js";
//#region lib/types/typert.host.js
/** Handwritten strict Host contribution matching the single Remote decorator. */
const TYPERT = {
	package: "@kirkchinese/dsh-citeciter",
	face: "host",
	schemas: [
		namedSchema("CitationDraft", citationDraftSchema),
		namedSchema("CitationRecord", citationRecordSchema),
		namedSchema("TopicSummary", topicSummarySchema),
		namedSchema("TopicSnapshot", topicSnapshotSchema),
		namedSchema("CiteCiterRequest", citeCiterRequestSchema),
		namedSchema("CiteCiterResponse", citeCiterResponseSchema),
		namedSchema("UpdateCheckResponse", updateCheckResponseSchema)
	],
	model: {
		services: [],
		events: [],
		objects: []
	},
	invocations: [citeCiterRequestDescriptor, updateCheckDescriptor]
};
//#endregion
export { TYPERT, TYPERT as default };
