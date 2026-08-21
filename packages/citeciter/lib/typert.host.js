import { c as citeCiterRequestSchema, l as citeCiterResponseSchema, m as topicSummarySchema, o as citationDraftSchema, p as topicSnapshotSchema, s as citationRecordSchema } from "./topic-CjNNXSWB.js";
import { t as citeCiterRequestDescriptor } from "./typert-common-CPi6bVCr.js";
//#region lib/types/typert.host.js
/** Handwritten strict Host contribution matching the single Remote decorator. */
const TYPERT = {
	package: "@kirkchinese/dsh-citeciter",
	face: "host",
	schemas: [
		{
			name: "CitationDraft",
			schema: citationDraftSchema
		},
		{
			name: "CitationRecord",
			schema: citationRecordSchema
		},
		{
			name: "TopicSummary",
			schema: topicSummarySchema
		},
		{
			name: "TopicSnapshot",
			schema: topicSnapshotSchema
		},
		{
			name: "CiteCiterRequest",
			schema: citeCiterRequestSchema
		},
		{
			name: "CiteCiterResponse",
			schema: citeCiterResponseSchema
		}
	],
	model: {
		services: [],
		events: [],
		objects: []
	},
	invocations: [citeCiterRequestDescriptor]
};
//#endregion
export { TYPERT, TYPERT as default };
