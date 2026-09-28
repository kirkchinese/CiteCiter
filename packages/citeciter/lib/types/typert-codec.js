/** Public Typert schema forms: 0.1.5 reads schema; 0.1.7 creates it lazily. Both refer to one schema. */
export function strictCodec(typeSymbol, schema) {
    return { mode: 'strict', typeSymbol, schema, create: () => schema };
}
/** Publish the same named schema through both supported registry contracts. */
export function namedSchema(name, schema) {
    return { name, schema, create: () => schema };
}
