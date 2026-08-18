import { citationRecordSchema } from "./thread.js";
import { prepareThreadDescriptor, prepareThreadResultSchema } from "./typert-common.js";
/** Handwritten strict Host contribution kept in sync with the Remote decorator. */
export const TYPERT = {
    package: '@kirkchinese/dsh-citeciter',
    face: 'host',
    schemas: [
        { name: 'CitationRecord', schema: citationRecordSchema },
        { name: 'PrepareThreadResult', schema: prepareThreadResultSchema },
    ],
    model: {
        services: [],
        events: [],
        objects: [],
    },
    invocations: [prepareThreadDescriptor],
};
export default TYPERT;
