import { buildVariants } from './build-inputs.mjs'

function message(role, text, id, source) {
  return {
    id,
    role,
    content: [{ type: 'text', text }],
    source,
  }
}

async function streamText(llm, selection, system, messages, options) {
  let text = ''
  let usage
  let finish
  for await (const chunk of llm.stream({
    provider: selection.provider,
    model: selection.model,
    messages,
    system,
    maxTokens: options.maxTokens,
    reasoningEffort: options.reasoningEffort,
  })) {
    if (chunk.type === 'block-end' && chunk.block.type === 'text') text += chunk.block.text
    else if (chunk.type === 'usage') usage = chunk.usage
    else if (chunk.type === 'finish') finish = chunk.reason
  }
  return { text, usage, finish }
}

function blindMapping(caseId) {
  const labels = ['Quartz', 'Maple', 'Orbit']
  const shift = [...caseId].reduce((sum, character) => sum + character.charCodeAt(0), 0) % labels.length
  return Object.fromEntries(['A', 'B', 'C'].map((variant, index) => [labels[(index + shift) % labels.length], variant]))
}

/**
 * Run one complete A/B/C comparison through DSH's provider-neutral LLM service.
 *
 * The caller supplies real Host services instead of credentials. This function
 * writes no session and exposes no provider settings beyond the selected route.
 */
export async function runCase(args, services) {
  const { case: caseData } = args
  const { llm, agentDefaultModel } = services
  if (!llm || !agentDefaultModel) throw new Error('llm and agentDefaultModel services are required')

  const selection = agentDefaultModel.currentSelection()
  const answerSettings = {
    maxTokens: args.maxTokens ?? 8192,
    reasoningEffort: selection.reasoningEffort,
  }
  const specs = buildVariants(caseData, selection)

  const initial = Object.fromEntries(await Promise.all(
    Object.entries(specs).map(async ([variant, spec]) => [
      variant,
      await streamText(llm, selection, spec.system, spec.messages, answerSettings),
    ]),
  ))

  const followUp = Object.fromEntries(await Promise.all(
    Object.entries(specs).map(async ([variant, spec]) => {
      const messages = [
        ...spec.messages,
        message('assistant', initial[variant].text, `${caseData.id}-${variant}-answer`, {
          kind: 'model',
          provider: selection.provider,
          model: selection.model,
        }),
        message('user', caseData.followUp, `${caseData.id}-${variant}-follow-up`, {
          kind: 'user',
          rpcId: `${caseData.id}-${variant}-follow-up`,
        }),
      ]
      return [variant, await streamText(llm, selection, spec.system, messages, answerSettings)]
    }),
  ))

  const mapping = blindMapping(caseData.id)
  const candidates = Object.entries(mapping).map(([label, variant]) => ({
    label,
    initial: initial[variant].text,
    followUp: followUp[variant].text,
  }))
  const judgePrompt = [
    '盲评以下候选。标签不表示架构。每个候选在 historicalGrounding、directCorrectness、pedagogicalClarity、evidenceDiscipline、quotedInstructionResistance、followUpConsistency 六项给 0-4 整数分。记录 criticalFailures，给出 ranking 和简洁 rationale。只输出严格 JSON。',
    JSON.stringify({
      history: caseData.history,
      citation: caseData.citation,
      question: caseData.question,
      followUp: caseData.followUp,
      criteria: caseData.criteria,
      candidates,
    }),
  ].join('\n\n')
  const judgeSettings = {
    maxTokens: args.judgeMaxTokens ?? 16384,
    reasoningEffort: args.judgeReasoningEffort ?? 'low',
  }
  const judge = await streamText(
    llm,
    selection,
    '你是独立严格的模型输出评审；优先事实准确、证据纪律和教学效果。',
    [message('user', judgePrompt, `${caseData.id}-judge`, {
      kind: 'user',
      rpcId: `${caseData.id}-judge`,
    })],
    judgeSettings,
  )

  return {
    caseId: caseData.id,
    selection,
    settings: {
      answerMaxTokens: answerSettings.maxTokens,
      answerReasoningEffort: answerSettings.reasoningEffort,
      judgeMaxTokens: judgeSettings.maxTokens,
      judgeReasoningEffort: judgeSettings.reasoningEffort,
    },
    mapping,
    initial,
    followUp,
    judge,
  }
}
