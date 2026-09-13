import type { TopicMessage } from '../../topic.ts'
import { learningTodos } from '../learning-route.ts'
import css from './LearningRoute.module.css'

/** Optional native todo projection. The user toggles planning; the model owns plan contents. */
export function LearningRoute({ enabled, messages, onChange }: {
  readonly enabled: boolean
  readonly messages: readonly TopicMessage[]
  readonly onChange: (enabled: boolean) => void
}) {
  const todos = learningTodos(messages)
  return <div className={css.route}>
    <label><input type="checkbox" checked={enabled} onChange={event => onChange(event.currentTarget.checked)} />学习路线</label>
    {enabled && todos.length > 0 && <details><summary>{todos.filter(item => item.status === 'completed').length} / {todos.length} · {todos.find(item => item.status === 'in_progress')?.content ?? '学习计划'}</summary><ol>{todos.map((item, index) => <li key={index} data-state={item.status}><span aria-hidden="true">{item.status === 'completed' ? '✓' : item.status === 'in_progress' ? '◉' : '○'}</span>{item.content}</li>)}</ol></details>}
  </div>
}
