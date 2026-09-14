import type { TopicMessage } from '../topic.ts'

/** Public todo states, projected from successful native todo_write results. */
export interface LearningTodo { readonly content: string, readonly status: 'pending' | 'in_progress' | 'completed' }

/** Read the last accepted plan; malformed historical tool arguments do not replace a valid plan. */
export function learningTodos(messages: readonly TopicMessage[]): readonly LearningTodo[] {
  let result: LearningTodo[] = []
  for (const message of messages) {
    if (message.role !== 'tool' || message.name !== 'todo_write' || message.running || message.isError) continue
    try {
      const input: unknown = JSON.parse(message.arguments)
      if (typeof input !== 'object' || input === null || !('todos' in input) || !Array.isArray(input.todos)) continue
      const values = input.todos as unknown[]
      if (values.every((value): value is LearningTodo => typeof value === 'object' && value !== null && 'content' in value && typeof value.content === 'string' && 'status' in value && ['pending', 'in_progress', 'completed'].includes(String(value.status)))) result = values
    } catch { /* Historical non-JSON arguments contain no recoverable plan. */ }
  }
  return result
}

/** One user-submitted learning request. Planning continues inside its ordinary Agent turn. */
export function withLearningRoute(question: string, enabled: boolean): string {
  return !enabled ? question : `${question}\n\n【学习路线已开启】请根据问题自动决定讲解方式与阶段，使用宿主 todo_write 建立和更新学习计划。可选择底层逻辑、定性分析、定量分析（板书）、概念关联和总结学习卡片；按内容取舍，不机械补齐。计划由你维护，完成后更新状态，不要要求用户逐个点击阶段。不额外启动模型请求。生成学习卡前先核对与纠错，标明未核实内容。`
}
