import { i as citationRecordSchema } from "./thread-D7ig_Lk7.js";
import { n as prepareThreadResultSchema, t as prepareThreadDescriptor } from "./typert-common-CLPMRe7a.js";
//#region lib/types/typert.host.js
/** Handwritten strict Host contribution kept in sync with the Remote decorator. */
const TYPERT = {
	package: "@kirkchinese/dsh-citeciter",
	face: "host",
	schemas: [{
		name: "CitationRecord",
		schema: citationRecordSchema
	}, {
		name: "PrepareThreadResult",
		schema: prepareThreadResultSchema
	}],
	model: {
		services: [],
		events: [],
		objects: []
	},
	invocations: [prepareThreadDescriptor]
};
//#endregion
export { TYPERT, TYPERT as default };
