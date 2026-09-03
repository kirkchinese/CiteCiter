import { citeCiterRequestDescriptor, updateCheckDescriptor } from "./typert-common.js";
/** Browser contribution mounted by the CiteCiter Client fiber. */
export const TYPERT_REMOTE = {
    package: '@kirkchinese/dsh-citeciter',
    descriptors: [citeCiterRequestDescriptor, updateCheckDescriptor],
};
export default TYPERT_REMOTE;
