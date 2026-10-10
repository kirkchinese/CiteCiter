/** Official Typert lazily resolves schemas after module registration. */
export function strictCodec<T>(typeSymbol: string, schema: T) {
  return { mode: 'strict' as const, typeSymbol, create: () => schema }
}

/** Register one named schema through the official registry contract. */
export function namedSchema<T>(name: string, schema: T) {
  return { name, create: () => schema }
}
