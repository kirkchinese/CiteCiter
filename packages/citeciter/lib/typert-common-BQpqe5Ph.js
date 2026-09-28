import { f as citeCiterRequestSchema, p as citeCiterResponseSchema, r as updateCheckResponseSchema } from "./update-CRD1jFLf.js";
//#region lib/types/typert-codec.js
/** Public Typert schema forms: 0.1.5 reads schema; 0.1.7 creates it lazily. Both refer to one schema. */
function strictCodec(typeSymbol, schema) {
	return {
		mode: "strict",
		typeSymbol,
		schema,
		create: () => schema
	};
}
/** Publish the same named schema through both supported registry contracts. */
function namedSchema(name, schema) {
	return {
		name,
		schema,
		create: () => schema
	};
}
//#endregion
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
		codec: strictCodec("@kirkchinese/dsh-citeciter#CiteCiterRequest", citeCiterRequestSchema)
	}],
	cancellation: { parameter: "signal" },
	result: strictCodec("@kirkchinese/dsh-citeciter#CiteCiterResponse", citeCiterResponseSchema),
	sourceLocation: {
		file: "src/index.ts",
		line: 127,
		column: 3
	}
};
/** Strict root-scoped read-only update check shared by Host and browser manifests. */
const updateCheckDescriptor = {
	id: "@kirkchinese/dsh-citeciter#citeciter/checkUpdate",
	service: "citeciter",
	namespace: "citeciter",
	method: "checkUpdate",
	invocation: { kind: "direct" },
	parameters: [],
	cancellation: { parameter: "signal" },
	result: strictCodec("@kirkchinese/dsh-citeciter#UpdateCheckResponse", updateCheckResponseSchema),
	sourceLocation: {
		file: "src/index.ts",
		line: 134,
		column: 3
	}
};
//#endregion
export { updateCheckDescriptor as n, namedSchema as r, citeCiterRequestDescriptor as t };
