/** Official Typert lazily resolves schemas after module registration. */
export declare function strictCodec<T>(typeSymbol: string, schema: T): {
    mode: "strict";
    typeSymbol: string;
    create: () => T;
};
/** Register one named schema through the official registry contract. */
export declare function namedSchema<T>(name: string, schema: T): {
    name: string;
    create: () => T;
};
