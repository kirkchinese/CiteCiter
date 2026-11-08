import type { ObservableSnapshot } from '@deepseek-ai/dsh-client-store';
import type { SessionId } from '@deepseek-ai/dsh-session/types';
import type { TeacherSuggestion } from '../topic.ts';
/** Per-Session running facts from DSH's UI status; `running` is absent until DSH knows it. */
export type RunningStatus = ReadonlyMap<SessionId, {
    readonly running?: boolean | undefined;
}>;
/**
 * Teacher mode's trigger: when the conversation on screen finishes a turn, ask the Host whether that turn holds
 * a point worth learning, and offer it. Only the conversation the user is looking at is watched.
 * @returns a disposer that stops watching.
 */
export declare function watchTeacherTurns(options: {
    readonly status: ObservableSnapshot<RunningStatus>;
    readonly current: () => SessionId | null;
    readonly enabled: () => boolean;
    readonly check: (sessionId: SessionId) => Promise<TeacherSuggestion | null>;
    readonly offer: (suggestion: TeacherSuggestion) => void;
    readonly warn: (message: string, error: unknown) => void;
}): () => void;
/** The question an "Explain" sends to a new Topic: the point, and a request to teach it from the source turn. */
export declare function teacherQuestion(suggestion: TeacherSuggestion): string;
