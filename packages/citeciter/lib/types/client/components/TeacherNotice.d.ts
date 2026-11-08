import type { TeacherSuggestion } from '../../topic.ts';
import type { TeacherActions } from '../view-actions.ts';
/**
 * Teacher mode's offer: a point worth learning from the latest turn, with Explain and Dismiss.
 * `bubble` speaks from the pet while Citer is closed; `bar` sits at the top of an open Citer.
 */
export declare function TeacherNotice({ suggestion, actions, variant }: {
    readonly suggestion: TeacherSuggestion;
    readonly actions: TeacherActions;
    readonly variant: 'bubble' | 'bar';
}): import("react").JSX.Element;
