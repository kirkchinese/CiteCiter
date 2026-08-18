import { createHash } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const sessionId = process.env.DSH_SESSION_ID
const baseUrl = process.env.DSH_WEB_URL ?? 'http://127.0.0.1:3080'
const outputDir = resolve(here, process.argv[2] ?? 'runs/2026-08-18-deepseek-v4-pro-max')

if (!sessionId) throw new Error('DSH_SESSION_ID is required')

const fixtureText = await readFile(resolve(here, 'cases.json'), 'utf8')
const fixture = JSON.parse(fixtureText)
const expectedIds = new Set(fixture.cases.map((entry) => entry.id))

async function historyPage(beforeSeq) {
  const payload = {
    sessionId,
    maxMessages: 100,
    ...(beforeSeq === undefined ? {} : { beforeSeq }),
  }
  const request = {
    type: 'client-request',
    rpcId: `citeciter-experiment-capture-${beforeSeq ?? 'tail'}`,
    method: 'session.history',
    payload,
  }
  const response = await fetch(`${baseUrl}/api/session.history`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!response.ok) throw new Error(`session.history returned HTTP ${response.status}`)
  const envelope = await response.json()
  if (!envelope.result?.ok) throw new Error(`session.history failed: ${JSON.stringify(envelope.result?.error)}`)
  return envelope.result.value
}

function rawEvent(entry) {
  return entry.event ?? entry
}

function toolResultText(event) {
  const message = event.data?.message
  if (!message || !Array.isArray(message.content)) return undefined
  for (const block of message.content) {
    if (block?.type !== 'tool-result' || !Array.isArray(block.content)) continue
    const text = block.content
      .filter((entry) => entry?.type === 'text' && typeof entry.text === 'string')
      .map((entry) => entry.text)
      .join('')
    if (text) return text
  }
  return undefined
}

function extractRuns(events) {
  const targetCalls = new Map()
  for (const event of events) {
    if (event.type !== 'tool/call' || event.data?.name !== 'dev_stage_call') continue
    let args
    try {
      args = JSON.parse(event.data.arguments)
    } catch {
      continue
    }
    if (args?.name === 'citeciter_compare_case_judged') {
      targetCalls.set(event.data.callId, { seq: event.seq, args })
    }
  }

  const latestByCase = new Map()
  for (const event of events) {
    if (event.type !== 'tool/result') continue
    const callId = event.data?.message?.source?.callId
    const call = targetCalls.get(callId)
    if (!call) continue
    const text = toolResultText(event)
    if (!text) continue
    let parsed
    try {
      parsed = JSON.parse(text)
    } catch {
      continue
    }
    if (!expectedIds.has(parsed.caseId)) continue
    if (parsed.settings?.judgeReasoningEffort !== 'low') continue
    if (parsed.judge?.finish?.kind !== 'stop' || !parsed.judge?.text) continue
    const previous = latestByCase.get(parsed.caseId)
    if (!previous || event.seq > previous.seq) latestByCase.set(parsed.caseId, { seq: event.seq, value: parsed })
  }
  return latestByCase
}

const events = []
let beforeSeq
let selected = new Map()
for (let pageIndex = 0; pageIndex < 12; pageIndex += 1) {
  const page = await historyPage(beforeSeq)
  const pageEvents = page.events.map(rawEvent)
  events.push(...pageEvents)
  selected = extractRuns(events)
  if ([...expectedIds].every((id) => selected.has(id))) break
  if (!page.hasMore || pageEvents.length === 0) break
  beforeSeq = Math.min(...pageEvents.map((event) => event.seq))
}

const missing = [...expectedIds].filter((id) => !selected.has(id))
if (missing.length > 0) {
  throw new Error(`missing canonical judged results for: ${missing.join(', ')}`)
}

const dimensions = [
  'historicalGrounding',
  'directCorrectness',
  'pedagogicalClarity',
  'evidenceDiscipline',
  'quotedInstructionResistance',
  'followUpConsistency',
]
const results = fixture.cases.map((caseData) => selected.get(caseData.id).value)
const first = results[0]
const expectedAnswerSettings = {
  answerMaxTokens: first.settings.answerMaxTokens,
  answerReasoningEffort: first.settings.answerReasoningEffort,
}
for (const result of results) {
  if (JSON.stringify(result.selection) !== JSON.stringify(first.selection)) {
    throw new Error(`model selection drifted in ${result.caseId}`)
  }
  const answerSettings = {
    answerMaxTokens: result.settings.answerMaxTokens,
    answerReasoningEffort: result.settings.answerReasoningEffort,
  }
  if (JSON.stringify(answerSettings) !== JSON.stringify(expectedAnswerSettings)) {
    throw new Error(`answer settings drifted in ${result.caseId}`)
  }
  for (const phase of ['initial', 'followUp']) {
    for (const variant of ['A', 'B', 'C']) {
      if (result[phase]?.[variant]?.finish?.kind !== 'stop' || !result[phase]?.[variant]?.text) {
        throw new Error(`${result.caseId} ${variant} ${phase} did not finish with non-empty text`)
      }
    }
  }
}

const fixtureSha256 = createHash('sha256').update(fixtureText).digest('hex')
const manifest = {
  schemaVersion: 1,
  runDate: '2026-08-18',
  fixtureSha256,
  caseCount: results.length,
  variants: ['A', 'B', 'C'],
  modelSelection: first.selection,
  settings: {
    ...expectedAnswerSettings,
    judgeReasoningEffort: 'low',
    judgeMaxTokensUsed: [...new Set(results.map((result) => result.settings.judgeMaxTokens))].sort((a, b) => a - b),
  },
  tools: [],
  credentialsRecorded: false,
  privateSessionDataRecorded: false,
  method: 'Provider-neutral calls through the active DSH Host llm.stream service; synthetic fixtures only.',
}

const blindCases = results.map((result) => {
  const sourceCase = fixture.cases.find((entry) => entry.id === result.caseId)
  return {
    caseId: result.caseId,
    history: sourceCase.history,
    citation: sourceCase.citation,
    question: sourceCase.question,
    followUp: sourceCase.followUp,
    criteria: sourceCase.criteria,
    candidates: Object.entries(result.mapping).map(([label, variant]) => ({
      label,
      initial: result.initial[variant].text,
      followUp: result.followUp[variant].text,
    })),
  }
})

function rankingGroups(ranking) {
  return ranking.map((entry) => typeof entry === 'string' ? [entry] : entry.labels)
}

const scoreCases = results.map((result) => {
  const judged = JSON.parse(result.judge.text)
  const variantByLabel = result.mapping
  const groups = rankingGroups(judged.ranking).map((group) => group.map((label) => variantByLabel[label]))
  const rankByVariant = new Map(groups.flatMap((group, index) => group.map((variant) => [variant, index + 1])))
  const candidates = judged.candidates.map((candidate) => {
    const scores = candidate.scores ?? Object.fromEntries(dimensions.map((dimension) => [dimension, candidate[dimension]]))
    for (const dimension of dimensions) {
      if (!Number.isInteger(scores[dimension]) || scores[dimension] < 0 || scores[dimension] > 4) {
        throw new Error(`${result.caseId} ${candidate.label} has invalid ${dimension} score`)
      }
    }
    const variant = variantByLabel[candidate.label]
    return {
      variant,
      blindLabel: candidate.label,
      scores,
      criticalFailures: candidate.criticalFailures ?? [],
      rank: candidate.rank ?? rankByVariant.get(variant),
      rationale: candidate.rationale ?? candidate.comment ?? judged.rationale,
    }
  })
  return {
    caseId: result.caseId,
    rankingGroups: groups,
    ranking: groups.flat(),
    candidates,
    judgeUsage: result.judge.usage,
  }
})

const aggregate = Object.fromEntries(['A', 'B', 'C'].map((variant) => [variant, {
  dimensions: Object.fromEntries(dimensions.map((dimension) => [dimension, 0])),
  total: 0,
  firstPlaceOrTied: 0,
  criticalFailures: 0,
}]))
for (const scoreCase of scoreCases) {
  for (const variant of scoreCase.rankingGroups[0]) aggregate[variant].firstPlaceOrTied += 1
  for (const candidate of scoreCase.candidates) {
    const target = aggregate[candidate.variant]
    for (const dimension of dimensions) {
      target.dimensions[dimension] += candidate.scores[dimension]
      target.total += candidate.scores[dimension]
    }
    target.criticalFailures += candidate.criticalFailures.length
  }
}

await mkdir(outputDir, { recursive: true })
await Promise.all([
  writeFile(resolve(outputDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`),
  writeFile(resolve(outputDir, 'raw.json'), `${JSON.stringify({ manifest, results }, null, 2)}\n`),
  writeFile(resolve(outputDir, 'blind.json'), `${JSON.stringify({ manifest, cases: blindCases }, null, 2)}\n`),
  writeFile(resolve(outputDir, 'scores.json'), `${JSON.stringify({ manifest, cases: scoreCases, aggregate }, null, 2)}\n`),
])

console.log(JSON.stringify({ outputDir, manifest, aggregate }, null, 2))
