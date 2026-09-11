/** User-flow acceptance through the public command boundary in the disposable real Host. */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { learningQuestion, projectLearningCards } from '../lib/types/learning.js'

/** Exercises isolated Topics only; the caller owns the real source and disposable DSH home. */
export async function acceptanceSmoke(ctx, source) {
  const runtime = ctx.citeciter
  const sourceSessionId = source.agent.session.id
  const baseline = source.agent.session.snapshotEvents()
  const signal = new AbortController().signal
  const command = value => runtime.request(value, signal)
  const checks = []
  const waitFor = async (id, condition = snapshot => !snapshot.topic.running) => {
    const deadline = Date.now() + 45_000
    while (Date.now() < deadline) {
      const { topic } = await command({ action: 'get', topicSessionId: id })
      if (condition(topic)) return topic
      await new Promise(resolve => setTimeout(resolve, 80))
    }
    throw new Error('Acceptance Topic timed out')
  }
  const initial = await command({ action: 'create', requestId: randomUUID(), sourceSessionId,
    mode: 'observer', scenario: 'qa', question: '工具能力' })
  const id = initial.topic.topic.sessionId
  let snapshot = await waitFor(id)
  assert.equal(snapshot.error, null)
  assert.equal(snapshot.topic.citation, null)
  const tools = snapshot.messages.filter(message => message.role === 'assistant').map(message => message.text).join('\n')
  assert.match(tools, /learning_cards/)
  assert.doesNotMatch(tools, /shell|write|edit/)
  checks.push('free Topic creation and read-only tools')

  const renamed = await command({ action: 'rename', topicSessionId: id, title: 'Acceptance Topic' })
  assert.equal(renamed.topic.topic.title, 'Acceptance Topic')
  const models = await command({ action: 'models' })
  assert.ok(models.providers.some(provider => provider.id === 'fixture'))
  const selected = await command({ action: 'select-model', topicSessionId: id, provider: 'fixture', model: 'fixture-alt', reasoningEffort: 'max' })
  assert.equal(selected.topic.topic.modelConfig.model, 'fixture-alt')
  assert.equal(selected.topic.topic.modelConfig.reasoningEffort, 'max')
  await assert.rejects(command({ action: 'select-model', topicSessionId: id, provider: 'fixture', model: 'missing', reasoningEffort: null }))
  assert.equal((await waitFor(id)).topic.modelConfig.model, 'fixture-alt')
  checks.push('rename, model/reasoning route and invalid-route rollback')

  const ask = question => command({ action: 'ask', topicSessionId: id, requestId: randomUUID(), question })
  await ask('停止恢复测试')
  const streaming = await waitFor(id, topic => topic.messages.some(message => message.role === 'assistant' && message.streaming && message.text !== ''))
  const delivered = streaming.messages.find(message => message.role === 'assistant' && message.streaming).text
  await command({ action: 'stop', topicSessionId: id })
  const stopped = await waitFor(id)
  assert.ok(stopped.messages.some(message => message.role === 'assistant' && !message.streaming && message.text.includes(delivered)))
  assert.ok(!stopped.messages.some(message => message.role === 'assistant' && message.streaming))
  await ask('[fixture:partial-error]')
  const partialFailure = await waitFor(id)
  assert.match(partialFailure.error ?? '', /Fixture partial failure/)
  assert.ok(partialFailure.messages.some(message => message.role === 'assistant' && message.text === '保留失败前的输出'))
  await ask('[fixture:error]')
  assert.match((await waitFor(id)).error ?? '', /Fixture provider failure/)
  await ask('工具能力')
  assert.equal((await waitFor(id)).error, null)
  checks.push('live streaming, retained output after stop/failure and follow-up recovery')

  await ask('向我提问')
  snapshot = await waitFor(id, snapshot => snapshot.pendingQuestion !== null)
  await command({ action: 'answer-question', topicSessionId: id, key: snapshot.pendingQuestion.key,
    answer: { answers: [{ id: 'learning-depth', selected: [], custom: '先讲直觉' }] } })
  assert.equal((await waitFor(id)).pendingQuestion, null)
  await ask('向我提问')
  snapshot = await waitFor(id, snapshot => snapshot.pendingQuestion !== null)
  await command({ action: 'cancel-question', topicSessionId: id, key: snapshot.pendingQuestion.key })
  assert.equal((await waitFor(id)).pendingQuestion, null)
  checks.push('answer and cancel a model question')

  await ask(learningQuestion('summary'))
  const firstCards = projectLearningCards((await waitFor(id)).messages)
  await ask(learningQuestion('summary', '重新整理'))
  const revisedCards = projectLearningCards((await waitFor(id)).messages)
  assert.equal(revisedCards.cards.length, 1)
  assert.notDeepEqual(revisedCards, firstCards)
  checks.push('repeat card generation projects the latest completed record')

  await command({ action: 'archive', topicSessionId: id, archived: true })
  assert.ok(!(await command({ action: 'list', sourceSessionId })).topics.some(topic => topic.sessionId === id))
  assert.ok((await command({ action: 'list', sourceSessionId, includeArchived: true })).topics.some(topic => topic.sessionId === id))
  await command({ action: 'archive', topicSessionId: id, archived: false })
  assert.equal((await waitFor(id)).topic.archived, false)
  await assert.rejects(command({ action: 'delete', topicSessionId: id, confirmSessionId: sourceSessionId }))
  assert.equal((await waitFor(id)).topic.sessionId, id)
  assert.equal((await command({ action: 'delete', topicSessionId: id, confirmSessionId: id })).kind, 'deleted')
  await assert.rejects(command({ action: 'get', topicSessionId: id }))
  checks.push('archive/restore and exact-identity deletion guard')

  const quote = '尾页：曲率描述平行移动的局部路径依赖。'
  const imported = await command({ action: 'document-import', title: 'Acceptance 长文档.md', format: 'markdown', content: '甲'.repeat(180_000) + '\n' + quote })
  const documentId = imported.document.documentId
  assert.ok((await command({ action: 'documents' })).documents.some(doc => doc.documentId === documentId))
  const firstPage = (await command({ action: 'document-get', documentId })).document
  const lastPage = (await command({ action: 'document-get', documentId, page: firstPage.pageCount - 1 })).document
  assert.equal(lastPage.content.endsWith(quote), true)
  const index = lastPage.content.indexOf(quote)
  const reading = await command({ action: 'create', requestId: randomUUID(), mode: 'observer', scenario: 'read', question: '工具能力',
    documentClaim: { sourceSessionId, documentId, displayText: quote, prefixText: lastPage.content.slice(Math.max(0, index - 240), index), suffixText: '' } })
  const readingId = reading.topic.topic.sessionId
  snapshot = await waitFor(readingId)
  assert.equal(snapshot.error, null)
  assert.equal(snapshot.topic.scenario, 'read')
  const readingTools = snapshot.messages.filter(message => message.role === 'assistant').map(message => message.text).join('\n')
  assert.match(readingTools, /read_document/)
  assert.match(readingTools, /glob/)
  assert.doesNotMatch(readingTools, /shell|write|edit/)
  checks.push('long document import, last-page citation and optional read-only project tools')

  assert.deepEqual(source.agent.session.snapshotEvents(), baseline)
  checks.push('source log unchanged after all operations')
  return { ok: true, checks, readingTopicSessionId: readingId, documentId }
}
