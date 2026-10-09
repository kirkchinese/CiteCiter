import { useEffect, useRef, useSyncExternalStore } from 'react';
/**
 * Keep the native carrier responsible for its timeout and late-reply channel.
 * Focus pauses only a pristine countdown; the first edit asks the Host to wait.
 * @param pending - the current Host carrier, never a copied question record.
 * @returns the form lifecycle and a ref identifying its answer surface.
 */
export function useNativeQuestionInteraction(pending) {
    const snapshot = useSyncExternalStore(pending.subscribe, pending.getSnapshot, pending.getSnapshot);
    const surface = useRef(null);
    useEffect(() => {
        const release = () => pending.releaseFocus();
        const refocus = () => { if (surface.current?.contains(document.activeElement) === true)
            pending.holdFocus(); };
        const visibility = () => { if (document.hidden)
            release();
        else
            refocus(); };
        window.addEventListener('blur', release);
        window.addEventListener('focus', refocus);
        document.addEventListener('visibilitychange', visibility);
        return () => {
            release();
            window.removeEventListener('blur', release);
            window.removeEventListener('focus', refocus);
            document.removeEventListener('visibilitychange', visibility);
        };
    }, [pending]);
    const status = pending.review !== undefined ? '已提交的回答'
        : pending.interrupted ? '上次运行已中断，可补充回答；手动提交后继续'
            : snapshot.state === 'continued' ? '模型已继续，可补充回答'
                : snapshot.countdown === undefined ? undefined
                    : snapshot.waitState === 'editing' || snapshot.waitState === 'waiting' ? '等待你完成回答'
                        : snapshot.waitState === 'focused' ? '输入区获得焦点，倒计时已暂停'
                            : `${Math.ceil(snapshot.countdown.remainingMs / 1000)} 秒后模型将继续`;
    return {
        surface,
        interaction: {
            state: snapshot.state, channel: snapshot.channel, closed: snapshot.closed,
            review: pending.review, dismissLabel: pending.dismissal === 'hide' ? '收起' : '取消', status,
            canTakeTime: snapshot.countdown !== undefined && snapshot.waitState !== 'editing' && snapshot.waitState !== 'waiting',
            allowSkip: pending.allowSkip ?? (pending.callId !== undefined && pending.kind !== 'plan-review'),
            focus: () => pending.holdFocus(), blur: () => pending.releaseFocus(),
            edit: () => pending.engage(), takeTime: () => pending.takeTime(),
        },
    };
}
