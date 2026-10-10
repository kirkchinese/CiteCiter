import { d as citeCiterRequestSchema, f as citeCiterResponseSchema, r as updateCheckResponseSchema } from "./update-DDut5jKW.js";
//#region lib/types/typert-codec.js
/** Official Typert lazily resolves schemas after module registration. */
function strictCodec(typeSymbol, schema) {
	return {
		mode: "strict",
		typeSymbol,
		create: () => schema
	};
}
/** Register one named schema through the official registry contract. */
function namedSchema(name, schema) {
	return {
		name,
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
