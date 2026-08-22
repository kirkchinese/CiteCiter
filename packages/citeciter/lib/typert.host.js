import { h as topicSummarySchema, l as citeCiterRequestSchema, m as topicSnapshotSchema, o as citationDraftSchema, s as citationRecordSchema, u as citeCiterResponseSchema } from "./topic-DByv84H6.js";
import { t as citeCiterRequestDescriptor } from "./typert-common-Bvx1k2cq.js";
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
