import type { SessionId } from '@deepseek-ai/dsh-session'
import type {
  RemoteResult,
  TypertRemoteContribution,
} from '@deepseek-ai/dsh-typert-protocol'
import type { PrepareThreadResult } from './index.ts'
import type { CitationRecord } from './thread.ts'
import { prepareThreadDescriptor } from './typert-common.ts'

declare module '@deepseek-ai/dsh-typert-protocol' {
  interface CiteCiterRemoteNamespace {
    prepareThread: (
      agentId: SessionId,
      citation: CitationRecord,
    ) => Promise<RemoteResult<PrepareThreadResult>>
  }
  interface TypertRemoteMap {
    'citeciter/prepareThread': CiteCiterRemoteNamespace['prepareThread']
  }
  interface TypertRemoteNamespaceMap {
    citeciter: CiteCiterRemoteNamespace
  }
  interface TypertRemoteScopeMap {
    'agent:citeciter/prepareThread': (
      citation: CitationRecord,
    ) => Promise<RemoteResult<PrepareThreadResult>>
  }
}

/** Browser contribution mounted by the CiteCiter Client fiber. */
export const TYPERT_REMOTE: TypertRemoteContribution = {
  package: '@kirkchinese/dsh-citeciter',
  descriptors: [prepareThreadDescriptor],
}

export default TYPERT_REMOTE
