import type { TopicMessage } from '../../topic.ts'
import { learningTodos } from '../learning-route.ts'
import css from './LearningRoute.module.css'

/** Progress of the optional learning route. It is switched in the Topic menu; the model owns the plan. */
export function LearningRoute({ enabled, messages }: {
  readonly enabled: boolean
  readonly messages: readonly TopicMessage[]
}) {
  const todos = learningTodos(messages)
  if (!enabled || todos.length === 0) return null
  return <details className={css.route}>
    <summary>学习路线 {todos.filter(item => item.status === 'completed').length} / {todos.length} · {todos.find(item => item.status === 'in_progress')?.content ?? '已完成'}</summary>
    <ol>{todos.map((item, index) => <li key={index} data-state={item.status}><span aria-hidden="true">{item.status === 'completed' ? '✓' : item.status === 'in_progress' ? '◉' : '○'}</span>{item.content}</li>)}</ol>
  </details>
}
