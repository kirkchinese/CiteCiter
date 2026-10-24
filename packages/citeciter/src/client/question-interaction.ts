import { t, useLocale } from './i18n.ts'
import { useEffect, useRef, useSyncExternalStore, type RefObject } from 'react'
import type { PendingQuestion } from '@deepseek-ai/dsh-client-ui-user-questions/client'
import type { AskUserQuestionAnswerItem } from '@deepseek-ai/dsh-user-questions'

/** Host-owned question lifecycle projected into a service-independent answer form. */
export interface QuestionInteraction {
  readonly state: 'open' | 'continued'
  readonly channel: 'waterfall' | 'rpc' | 'none'
  readonly closed: boolean
  readonly review: readonly AskUserQuestionAnswerItem[] | undefined
  readonly dismissLabel: string
  readonly status: string | undefined
  readonly canTakeTime: boolean
  readonly allowSkip: boolean
  focus(): void
  blur(): void
  edit(): void
  takeTime(): void
}

/**
 * Keep the native carrier responsible for its timeout and late-reply channel.
 * Focus pauses only a pristine countdown; the first edit asks the Host to wait.
 * @param pending - the current Host carrier, never a copied question record.
 * @returns the form lifecycle and a ref identifying its answer surface.
 */
export function useNativeQuestionInteraction(pending: Pick<PendingQuestion,
  'subscribe' | 'getSnapshot' | 'review' | 'dismissal' | 'holdFocus' | 'releaseFocus' | 'engage' | 'takeTime'>
  & { readonly callId?: string | undefined; readonly kind?: string | undefined; readonly allowSkip?: boolean; readonly interrupted?: boolean }): {
  readonly interaction: QuestionInteraction
  readonly surface: RefObject<HTMLFormElement>
} {
  useLocale()
  const snapshot = useSyncExternalStore(pending.subscribe, pending.getSnapshot, pending.getSnapshot)
  const surface = useRef<HTMLFormElement>(null)
  useEffect(() => {
    const release = () => pending.releaseFocus()
    const refocus = () => { if (surface.current?.contains(document.activeElement) === true) pending.holdFocus() }
    const visibility = () => { if (document.hidden) release(); else refocus() }
    window.addEventListener('blur', release)
    window.addEventListener('focus', refocus)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      release()
      window.removeEventListener('blur', release)
      window.removeEventListener('focus', refocus)
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [pending])
  const status = pending.review !== undefined ? t('panel.question.submitted')
    : pending.interrupted ? t('panel.question.interrupted')
      : snapshot.state === 'continued' ? t('panel.question.canReply')
      : snapshot.countdown === undefined ? undefined
        : snapshot.waitState === 'editing' || snapshot.waitState === 'waiting' ? t('panel.question.waiting')
          : snapshot.waitState === 'focused' ? t('panel.question.focused')
            : t('panel.question.countdown', { seconds: Math.ceil(snapshot.countdown.remainingMs / 1000) })
  return {
    surface,
    interaction: {
      state: snapshot.state, channel: snapshot.channel, closed: snapshot.closed,
      review: pending.review, dismissLabel: pending.dismissal === 'hide' ? t('panel.header.collapse') : t('common.cancel'), status,
      canTakeTime: snapshot.countdown !== undefined && snapshot.waitState !== 'editing' && snapshot.waitState !== 'waiting',
      allowSkip: pending.allowSkip ?? (pending.callId !== undefined && pending.kind !== 'plan-review'),
      focus: () => pending.holdFocus(), blur: () => pending.releaseFocus(),
      edit: () => pending.engage(), takeTime: () => pending.takeTime(),
    },
  }
}
