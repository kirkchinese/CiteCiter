import { z } from 'zod';
/** User-selected teaching stages; these indicate intent, never measured mastery. */
export const LEARNING_STAGES = [
    { id: 'logic', label: '底层逻辑', shortLabel: '逻辑', hint: '从定义、成立条件和因果机制讲起。', instruction: '请讲清当前主题的底层逻辑：先给出定义和成立条件，再解释因果机制与为什么成立。区分来源证据、一般知识和假设。只讲这一阶段，不自动推进。' },
    { id: 'qualitative', label: '定性分析', shortLabel: '定性', hint: '看方向、边界，以及改变条件会发生什么。', instruction: '请对当前主题做定性分析：解释变量或因素之间的关系、变化方向、边界与反例，用一个具体情境说明。只讲这一阶段，不自动推进。' },
    { id: 'quantitative', label: '定量分析（板书）', shortLabel: '定量', hint: '把变量、推导和算例写到板书上。', instruction: '请对当前主题做定量分析，并调用 blackboard_apply 整理板书：注明变量、单位、假设、推导步骤与一个可核查算例。示例数值必须标明是假设，不得伪造来源数据。如果此主题不适合定量或信息不足，请明确说明原因。只讲这一阶段，不自动推进。' },
    { id: 'connections', label: '概念关联', shortLabel: '关联', hint: '说明它与哪些概念相连，以及为什么。', instruction: '请围绕当前主题给出 2–4 个最有帮助的概念关联，逐一解释是前提、推论、类比还是对比，说明关联理由与类比的边界。需要时用板书画关系。只讲这一阶段，不自动推进。' },
    { id: 'summary', label: '总结学习卡片', shortLabel: '总结', hint: '把本次讨论整理成能再次读懂的学习卡片。', instruction: '请总结本 Topic 已讨论的内容，调用 learning_cards 生成 1–6 张学习卡片。每张包含核心结论、一个具体例子、可选自测问题和参考答案；不要补造未证实结论，涉及来源事实时在结论中保留来源定位。完成后简短说明，不安排复习计划。' },
];
/** Make the entire stage instruction visible and durable as an ordinary Topic user message. */
export function learningQuestion(stageId, question = '') {
    const stage = LEARNING_STAGES.find(candidate => candidate.id === stageId);
    return `【学习阶段：${stage.label}】\n${stage.instruction}${question.trim() === '' ? '' : `\n\n我的问题：${question.trim()}`}`;
}
/** Recover the most recently requested stage from this Topic's own visible history. */
export function latestLearningStage(messages) {
    for (const message of [...messages].reverse()) {
        if (message.role !== 'user')
            continue;
        const stage = LEARNING_STAGES.find(candidate => message.text.startsWith(`【学习阶段：${candidate.label}】\n`));
        if (stage !== undefined)
            return stage.id;
    }
    return null;
}
export const learningCardSchema = z.object({
    title: z.string().trim().min(1).max(100),
    summary: z.string().trim().min(1).max(2000),
    example: z.string().trim().min(1).max(1500),
    question: z.string().trim().min(1).max(500),
    answer: z.string().trim().min(1).max(2000),
}).strict();
export const learningCardsInputSchema = z.object({ cards: z.array(learningCardSchema).min(1).max(8) }).strict();
/**
 * Recover the latest complete card set from successful Topic tool records.
 * Pending, failed and malformed records cannot replace the previous valid set.
 * No separate storage or migration is needed; older sets remain in the Topic log.
 */
export function projectLearningCards(messages) {
    let result = { cards: [], messageId: null, invalid: 0 };
    for (const message of messages) {
        if (message.role !== 'tool' || message.name !== 'learning_cards' || message.running || message.isError || message.result === null)
            continue;
        try {
            const input = learningCardsInputSchema.parse(JSON.parse(message.arguments));
            const output = z.object({ saved: z.number().int().min(1).max(8) }).strict().parse(JSON.parse(message.result));
            if (output.saved !== input.cards.length)
                throw new Error('card count does not match the committed result');
            result = { ...result, cards: input.cards, messageId: message.id };
        }
        catch {
            // A malformed persisted tool record must not erase an earlier usable set.
            result = { ...result, invalid: result.invalid + 1 };
        }
    }
    return result;
}
/** Export the visible set with its Topic provenance; content is plain Markdown, never executed. */
export function learningCardsMarkdown(cards, topicTitle, topicId, source) {
    return `# ${topicTitle}\n\nTopic: ${topicId}\n\n来源：${source}\n\n${cards.map((card, index) => `## ${index + 1}. ${card.title}\n\n${card.summary}\n\n**例子**\n\n${card.example}\n\n**可选自测**\n\n${card.question}\n\n**参考答案**\n\n${card.answer}`).join('\n\n---\n\n')}\n`;
}
/** Shared teaching contract appended to every scenario's logged tutor section. */
export const LEARNING_PROMPT = `The optional learning route is 底层逻辑 → 定性分析 → 定量分析（板书） → 概念关联 → 总结学习卡片. A user may select or skip any stage. Respond to the current request only; never advance automatically or claim that a stage proves mastery. Never schedule spaced repetition or reminders. Do not require quizzes before continuing.

Use learning_cards only when the user asks to summarize or revise learning cards. Each successful call replaces the visible card set for this Topic; older sets remain in its log. Send the complete desired set in one call, not separate calls for individual cards. Write concise, source-grounded summaries and examples, plus a question and reference answer for optional self-testing. Preserve available source locators inside summaries. Do not invent sources or evidence. Cards and blackboard tools only record learning material inside this independent Topic; they never write to the workspace or source Session.`;
