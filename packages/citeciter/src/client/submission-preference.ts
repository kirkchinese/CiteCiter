import type { Context } from '@deepseek-ai/cordis'
import type { ConversationSettings } from '@deepseek-ai/dsh-client-ui-conversation'
import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import type { DeliveryMode } from './native-composer.ts'

/** Read the conversation-owned busy-Enter preference through the public settings mirror. The bound scope is disposed with ctx; this adapter never writes Host settings. */
export function bindSubmissionPreference(ctx: Context): ObservableSnapshot<DeliveryMode> {
  // Public namespace from DSH submission-settings; no Host runtime value imports in the Client bundle.
  const scope = ctx.settingsScope.bind<ConversationSettings>({ namespace: 'ui-conversation' })
  return {
    getSnapshot: () => scope.getSnapshot().value?.busyEnter ?? 'queue',
    subscribe: listener => scope.subscribe(listener),
  }
}
