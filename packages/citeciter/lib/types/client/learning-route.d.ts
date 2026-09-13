import type { TopicMessage } from '../topic.ts';
/** Public todo states, projected from successful native todo_write results. */
export interface LearningTodo {
    readonly content: string;
    readonly status: 'pending' | 'in_progress' | 'completed';
}
/** Read the last accepted plan; malformed historical tool arguments do not replace a valid plan. */
export declare function learningTodos(messages: readonly TopicMessage[]): readonly LearningTodo[];
/** One user-submitted learning request. Planning continues inside its ordinary Agent turn. */
export declare function withLearningRoute(question: string, enabled: boolean): string;
