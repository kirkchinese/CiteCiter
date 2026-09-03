import type {
  RemoteResult,
  TypertRemoteContribution,
} from '@deepseek-ai/dsh-typert-protocol'
import type { CiteCiterRequest, CiteCiterResponse } from './topic.ts'
import type { UpdateCheckResponse } from './update.ts'
import { citeCiterRequestDescriptor, updateCheckDescriptor } from './typert-common.ts'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface CiteCiterRemoteNamespace {
    request: (request: CiteCiterRequest, signal?: AbortSignal) => Promise<RemoteResult<CiteCiterResponse>>
    checkUpdate: (signal?: AbortSignal) => Promise<RemoteResult<UpdateCheckResponse>>
  }
  interface TypertRemoteMap {
    'citeciter/request': CiteCiterRemoteNamespace['request']
    'citeciter/checkUpdate': CiteCiterRemoteNamespace['checkUpdate']
  }
  interface TypertRemoteNamespaceMap {
    citeciter: CiteCiterRemoteNamespace
  }
}

/** Browser contribution mounted by the CiteCiter Client fiber. */
export const TYPERT_REMOTE: TypertRemoteContribution = {
  package: '@kirkchinese/dsh-citeciter',
  descriptors: [citeCiterRequestDescriptor, updateCheckDescriptor],
}

export default TYPERT_REMOTE
