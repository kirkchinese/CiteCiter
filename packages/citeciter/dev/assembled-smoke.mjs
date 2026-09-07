/** Keyless real-profile smoke: the host loop supplies source and private Topic logs. */
import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises'
import { basename, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SessionId } from '@deepseek-ai/dsh-session'
import { MessageId } from '@deepseek-ai/dsh-llm'
import { LEARNING_STAGES, learningQuestion, projectLearningCards, latestLearningStage } from '../lib/types/learning.js'

export const name = 'citeciter-assembled-smoke'
export const inject = ['agents', 'sessions', 'citeciterRuntime', 'llm']

async function settled(service, id) {
  const deadline = Date.now() + 45_000
  while (Date.now() < deadline) {
    const snapshot = await service.get(id)
    if (!snapshot.topic.running) return snapshot
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  throw new Error('Topic did not settle within 45 seconds')
}

/** Run only when explicitly mounted in a disposable DSH_HOME. */
export function apply(ctx) {
  ctx.effect(() => {
    let task
    const timer = setTimeout(() => { task = run(ctx) }, 0)
    return async () => { clearTimeout(timer); const source = await task; await source?.dispose() }
  }, 'citeciter: assembled fixture')
}

async function run(ctx) {
  const dshHome = process.env.DSH_HOME
  if (!dshHome || !/^(?:dsh-rc1|desktop-rc1|citeciter-dsh-rc1-[\w-]+)$/u.test(basename(resolve(dshHome)))) {
    ctx.logger.error('Smoke requires an explicitly isolated CiteCiter test home')
    return
  }
    const out = join(dshHome, 'assembled-smoke.json')
    let source
    try {
      if (process.env.CITECITER_VERIFY_RESTORE === '1') {
        const previous = JSON.parse(await readFile(out, 'utf8'))
        assert.equal(previous.ok, true)
        for (const saved of previous.snapshots) {
          const restored = await ctx.citeciterRuntime.get(saved.topic.sessionId)
          assert.equal(restored.error, null)
          assert.deepEqual(projectLearningCards(restored.messages), projectLearningCards(saved.messages))
          assert.equal(latestLearningStage(restored.messages), 'summary')
          assert.deepEqual(restored.board, saved.board)
        }
        await writeFile(join(dshHome, 'restored-smoke.json'), JSON.stringify({ ok: true }) + '\n')
        return
      }
      source = await ctx.agents.create({
        sessionId: SessionId(`session-${randomUUID()}`),
        meta: { cwd: fileURLToPath(new URL('../../../', import.meta.url)), agentPreset: 'standard' },
        agentOptions: { provider: 'fixture', model: 'fixture' },
      })
      source.agent.followup({
        id: MessageId(randomUUID()), role: 'user', source: { kind: 'user' },
        content: [{ type: 'text', text: 'Explain curvature and parallel transport.' }],
      })
      await source.agent.whenIdle()
      await ctx.sessions.flush(source.agent.session)
      const baseline = source.agent.session.snapshotEvents()
      const answer = baseline.find(event => event.type === 'assistant/message')
      assert.ok(answer, 'The real source loop must produce a committed answer')
      const evidenceText = answer.data.message.content.find(block => block.type === 'text').text.split('\n')[0]
      const snapshots = []
      for (const mode of ['observer', 'exact-fork']) {
        const initial = await ctx.citeciterRuntime.create({
          action: 'create', requestId: randomUUID(), mode,
          selectionClaim: { sourceSessionId: source.agent.session.id, anchorSeq: answer.seq,
            displayText: evidenceText, prefixText: '', suffixText: '' },
          question: '请解释这段内容并演示黑板', scenario: 'present',
        })
        const first = await settled(ctx.citeciterRuntime, initial.topic.sessionId)
        assert.equal(first.error, null)
        assert.equal(first.board.elements.length, 2)
        assert.ok(first.messages.some(message => message.role === 'tool' && message.name === 'blackboard_apply' && !message.isError))
        await ctx.citeciterRuntime.ask({ action: 'ask', topicSessionId: first.topic.sessionId, requestId: randomUUID(), question: '工具能力' })
        await settled(ctx.citeciterRuntime, first.topic.sessionId)
        for (const stage of LEARNING_STAGES) {
          await ctx.citeciterRuntime.ask({ action: 'ask', topicSessionId: first.topic.sessionId, requestId: randomUUID(), question: learningQuestion(stage.id) })
          const step = await settled(ctx.citeciterRuntime, first.topic.sessionId)
          assert.equal(step.error, null)
          assert.equal(latestLearningStage(step.messages), stage.id)
        }
        const final = await ctx.citeciterRuntime.get(first.topic.sessionId)
        assert.equal(projectLearningCards(final.messages).cards.length, 1)
        assert.ok(final.board.elements.some(element => element.id === 'quantitative-example'))
        snapshots.push(final)
      }
      assert.deepEqual(source.agent.session.snapshotEvents(), baseline, 'Topics must not modify source events')
      const transcript = snapshots.map(snapshot => ({
        mode: snapshot.topic.mode,
        messages: snapshot.messages.filter(message => message.role === 'user' || message.role === 'assistant' && message.text.trim() !== '')
          .map(({ role, text }) => ({ role, text: text.trim() })),
        tools: snapshot.messages.filter(message => message.role === 'tool').map(({ name, isError }) => ({ name, isError })),
        board: snapshot.board.elements.map(({ id, kind, content }) => ({ id, kind, content })),
        cards: projectLearningCards(snapshot.messages).cards,
      }))
      const expectedPath = new URL('../tests/snapshots/assembled-topic.json', import.meta.url)
      if (process.env.CITECITER_RECORD_SNAPSHOT === '1') {
        await writeFile(expectedPath, JSON.stringify(transcript, null, 2) + '\n')
      } else {
        assert.deepEqual(transcript, JSON.parse(await readFile(expectedPath, 'utf8')))
      }
      await mkdir(dshHome, { recursive: true })
      await writeFile(out + '.tmp', JSON.stringify({ ok: true, sourceSessionId: source.agent.session.id, snapshots }, null, 2) + '\n')
      await rename(out + '.tmp', out)
      ctx.logger.info('CiteCiter assembled smoke passed: %s', out)
    } catch (error) {
      if (process.env.CITECITER_VERIFY_RESTORE === '1') {
        await writeFile(join(dshHome, 'restored-smoke.json'), JSON.stringify({ ok: false, error: String(error), stack: error.stack }) + '\n')
        return
      }
      await writeFile(out + '.tmp', JSON.stringify({ ok: false, error: String(error), stack: error.stack,
        events: source?.agent.session.snapshotEvents().filter(event => /error|end$/u.test(event.type)),
      }, null, 2) + '\n')
      await rename(out + '.tmp', out)
      ctx.logger.error('CiteCiter assembled smoke failed', error)
    }
    // Keep the source available for live browser QA; its ownership ends with this plugin.
    return source
}
