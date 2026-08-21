import type {
  RemoteResult,
  TypertRemoteContribution,
} from '@deepseek-ai/dsh-typert-protocol'
import type { CiteCiterRequest, CiteCiterResponse } from './topic.ts'
import { citeCiterRequestDescriptor } from './typert-common.ts'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface CiteCiterRemoteNamespace {
    request: (request: CiteCiterRequest) => Promise<RemoteResult<CiteCiterResponse>>
  }
  interface TypertRemoteMap {
    'citeciter/request': CiteCiterRemoteNamespace['request']
  }
  interface TypertRemoteNamespaceMap {
    citeciter: CiteCiterRemoteNamespace
  }
}

/** Browser contribution mounted by the CiteCiter Client fiber. */
export const TYPERT_REMOTE: TypertRemoteContribution = {
  package: '@kirkchinese/dsh-citeciter',
  descriptors: [citeCiterRequestDescriptor],
}

export default TYPERT_REMOTE
