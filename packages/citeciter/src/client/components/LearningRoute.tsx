import type { TopicMessage } from '../../topic.ts'
import { learningTodos } from '../learning-route.ts'
import { t, useLocale } from '../i18n.ts'
import css from './LearningRoute.module.css'

/** Progress of the optional learning route. It is switched in the Topic menu; the model owns the plan. */
export function LearningRoute({ enabled, messages }: {
  readonly enabled: boolean
  readonly messages: readonly TopicMessage[]
}) {
  useLocale()
  const todos = learningTodos(messages)
  if (!enabled || todos.length === 0) return null
  return <details className={css.route}>
    <summary>{t('board.route.progress', { completed: todos.filter(item => item.status === 'completed').length, total: todos.length, current: todos.find(item => item.status === 'in_progress')?.content ?? t('board.route.completed') })}</summary>
    <ol>{todos.map((item, index) => <li key={index} data-state={item.status}><span aria-hidden="true">{item.status === 'completed' ? '✓' : item.status === 'in_progress' ? '◉' : '○'}</span>{item.content}</li>)}</ol>
  </details>
}
