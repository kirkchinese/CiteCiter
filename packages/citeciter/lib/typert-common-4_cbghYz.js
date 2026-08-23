import { l as citeCiterRequestSchema, u as citeCiterResponseSchema } from "./topic-BVNCaVbJ.js";
//#region lib/types/typert-common.js
/** Strict root-scoped Topic command shared by Host and browser manifests. */
const citeCiterRequestDescriptor = {
	id: "@kirkchinese/dsh-citeciter#citeciter/request",
	service: "citeciter",
	namespace: "citeciter",
	method: "request",
	invocation: { kind: "direct" },
	parameters: [{
		name: "rawRequest",
		wire: "rawRequest",
		source: "json",
		codec: {
			mode: "strict",
			typeSymbol: "@kirkchinese/dsh-citeciter#CiteCiterRequest",
			schema: citeCiterRequestSchema
		}
	}],
	cancellation: { parameter: "signal" },
	result: {
		mode: "strict",
		typeSymbol: "@kirkchinese/dsh-citeciter#CiteCiterResponse",
		schema: citeCiterResponseSchema
	},
	sourceLocation: {
		file: "src/index.ts",
		line: 66,
		column: 3
	}
};
//#endregion
export { citeCiterRequestDescriptor as t };
