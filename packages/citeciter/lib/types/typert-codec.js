/** Official Typert lazily resolves schemas after module registration. */
export function strictCodec(typeSymbol, schema) {
    return { mode: 'strict', typeSymbol, create: () => schema };
}
/** Register one named schema through the official registry contract. */
export function namedSchema(name, schema) {
    return { name, create: () => schema };
}
