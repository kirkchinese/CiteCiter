import { b as topicSnapshotSchema, c as citationDraftSchema, d as citeCiterRequestSchema, f as citeCiterResponseSchema, l as citationRecordSchema, r as updateCheckResponseSchema, x as topicSummarySchema } from "./update-DDut5jKW.js";
import { n as updateCheckDescriptor, r as namedSchema, t as citeCiterRequestDescriptor } from "./typert-common-BRv6PLDv.js";
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
