import { type ReactNode } from 'react';
import type { PendingQuestion } from '../../topic.ts';
import type { NativeComposer } from '../native-composer.ts';
/** Private Topic questions share native wait semantics without joining the Host's Session list. */
export declare function TopicQuestions({ sessionId, pending, native, children }: {
    readonly sessionId: string;
    readonly pending: readonly PendingQuestion[];
    readonly native: NativeComposer;
    readonly children: ReactNode;
}): import("react").JSX.Element;
