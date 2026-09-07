import { z } from 'zod';
import type { TopicMessage } from './topic.ts';
/** User-selected teaching stages; these indicate intent, never measured mastery. */
export declare const LEARNING_STAGES: readonly [{
    readonly id: "logic";
    readonly label: "底层逻辑";
    readonly shortLabel: "逻辑";
    readonly hint: "从定义、成立条件和因果机制讲起。";
    readonly instruction: "请讲清当前主题的底层逻辑：先给出定义和成立条件，再解释因果机制与为什么成立。区分来源证据、一般知识和假设。只讲这一阶段，不自动推进。";
}, {
    readonly id: "qualitative";
    readonly label: "定性分析";
    readonly shortLabel: "定性";
    readonly hint: "看方向、边界，以及改变条件会发生什么。";
    readonly instruction: "请对当前主题做定性分析：解释变量或因素之间的关系、变化方向、边界与反例，用一个具体情境说明。只讲这一阶段，不自动推进。";
}, {
    readonly id: "quantitative";
    readonly label: "定量分析（板书）";
    readonly shortLabel: "定量";
    readonly hint: "把变量、推导和算例写到板书上。";
    readonly instruction: "请对当前主题做定量分析，并调用 blackboard_apply 整理板书：注明变量、单位、假设、推导步骤与一个可核查算例。示例数值必须标明是假设，不得伪造来源数据。如果此主题不适合定量或信息不足，请明确说明原因。只讲这一阶段，不自动推进。";
}, {
    readonly id: "connections";
    readonly label: "概念关联";
    readonly shortLabel: "关联";
    readonly hint: "说明它与哪些概念相连，以及为什么。";
    readonly instruction: "请围绕当前主题给出 2–4 个最有帮助的概念关联，逐一解释是前提、推论、类比还是对比，说明关联理由与类比的边界。需要时用板书画关系。只讲这一阶段，不自动推进。";
}, {
    readonly id: "summary";
    readonly label: "总结学习卡片";
    readonly shortLabel: "总结";
    readonly hint: "把本次讨论整理成能再次读懂的学习卡片。";
    readonly instruction: "请总结本 Topic 已讨论的内容，调用 learning_cards 生成 1–6 张学习卡片。每张包含核心结论、一个具体例子、可选自测问题和参考答案；不要补造未证实结论，涉及来源事实时在结论中保留来源定位。完成后简短说明，不安排复习计划。";
}];
export type LearningStageId = typeof LEARNING_STAGES[number]['id'];
/** Make the entire stage instruction visible and durable as an ordinary Topic user message. */
export declare function learningQuestion(stageId: LearningStageId, question?: string): string;
/** Recover the most recently requested stage from this Topic's own visible history. */
export declare function latestLearningStage(messages: readonly TopicMessage[]): LearningStageId | null;
export declare const learningCardSchema: z.ZodObject<{
    title: z.ZodString;
    summary: z.ZodString;
    example: z.ZodString;
    question: z.ZodString;
    answer: z.ZodString;
}, z.core.$strict>;
export declare const learningCardsInputSchema: z.ZodObject<{
    cards: z.ZodArray<z.ZodObject<{
        title: z.ZodString;
        summary: z.ZodString;
        example: z.ZodString;
        question: z.ZodString;
        answer: z.ZodString;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type LearningCard = z.infer<typeof learningCardSchema>;
export interface LearningCardsProjection {
    readonly cards: readonly LearningCard[];
    /** Successful tool message owning this set, or null before any valid set exists. */
    readonly messageId: string | null;
    readonly invalid: number;
}
/**
 * Recover the latest complete card set from successful Topic tool records.
 * Pending, failed and malformed records cannot replace the previous valid set.
 * No separate storage or migration is needed; older sets remain in the Topic log.
 */
export declare function projectLearningCards(messages: readonly TopicMessage[]): LearningCardsProjection;
/** Export the visible set with its Topic provenance; content is plain Markdown, never executed. */
export declare function learningCardsMarkdown(cards: readonly LearningCard[], topicTitle: string, topicId: string, source: string): string;
/** Shared teaching contract appended to every scenario's logged tutor section. */
export declare const LEARNING_PROMPT = "The optional learning route is \u5E95\u5C42\u903B\u8F91 \u2192 \u5B9A\u6027\u5206\u6790 \u2192 \u5B9A\u91CF\u5206\u6790\uFF08\u677F\u4E66\uFF09 \u2192 \u6982\u5FF5\u5173\u8054 \u2192 \u603B\u7ED3\u5B66\u4E60\u5361\u7247. A user may select or skip any stage. Respond to the current request only; never advance automatically or claim that a stage proves mastery. Never schedule spaced repetition or reminders. Do not require quizzes before continuing.\n\nUse learning_cards only when the user asks to summarize or revise learning cards. Each successful call replaces the visible card set for this Topic; older sets remain in its log. Send the complete desired set in one call, not separate calls for individual cards. Write concise, source-grounded summaries and examples, plus a question and reference answer for optional self-testing. Preserve available source locators inside summaries. Do not invent sources or evidence. Cards and blackboard tools only record learning material inside this independent Topic; they never write to the workspace or source Session.";
