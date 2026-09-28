/** Public Typert schema forms: 0.1.5 reads schema; 0.1.7 creates it lazily. Both refer to one schema. */
export declare function strictCodec<T>(typeSymbol: string, schema: T): {
    mode: "strict";
    typeSymbol: string;
    schema: T;
    create: () => T;
};
/** Publish the same named schema through both supported registry contracts. */
export declare function namedSchema<T>(name: string, schema: T): {
    name: string;
    schema: T;
    create: () => T;
};
