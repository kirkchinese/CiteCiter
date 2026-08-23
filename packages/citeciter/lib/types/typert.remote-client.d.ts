import type { RemoteResult, TypertRemoteContribution } from '@deepseek-ai/dsh-typert-protocol';
import type { CiteCiterRequest, CiteCiterResponse } from './topic.ts';
declare module '@deepseek-ai/dsh-typert-protocol' {
    interface CiteCiterRemoteNamespace {
        request: (request: CiteCiterRequest, signal?: AbortSignal) => Promise<RemoteResult<CiteCiterResponse>>;
    }
    interface TypertRemoteMap {
        'citeciter/request': CiteCiterRemoteNamespace['request'];
    }
    interface TypertRemoteNamespaceMap {
        citeciter: CiteCiterRemoteNamespace;
    }
}
/** Browser contribution mounted by the CiteCiter Client fiber. */
export declare const TYPERT_REMOTE: TypertRemoteContribution;
export default TYPERT_REMOTE;
