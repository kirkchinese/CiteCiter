/** Public Typert schema forms: 0.1.5 reads schema; 0.1.7 creates it lazily. Both refer to one schema. */
export function strictCodec<T>(typeSymbol: string, schema: T) {
  return { mode: 'strict' as const, typeSymbol, schema, create: () => schema }
}

/** Publish the same named schema through both supported registry contracts. */
export function namedSchema<T>(name: string, schema: T) {
  return { name, schema, create: () => schema }
}
