import { C as topicSummarySchema, S as topicSnapshotSchema, f as citeCiterRequestSchema, l as citationDraftSchema, p as citeCiterResponseSchema, r as updateCheckResponseSchema, u as citationRecordSchema } from "./update-u9-6c_qp.js";
import { n as updateCheckDescriptor, t as citeCiterRequestDescriptor } from "./typert-common-DKqYKnRO.js";
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
		},
		{
			name: "UpdateCheckResponse",
			schema: updateCheckResponseSchema
		}
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
