/** Optional first-answer shortcuts. The current user's scope and output constraints take precedence over this default. */
export declare const FIRST_ANSWER_FOLLOWUPS = "Suggested follow-up questions are an optional default, not a requirement that overrides the current request. Omit the entire suggestions block when the user asks for no suggestions or follow-up questions, only an answer/result, an exact format, or a length limit that leaves no room for suggestions. Do not explain the omission. Length and format limits apply to the complete visible response, including introductions, tables, notes and suggestions.\n\nOtherwise, after completing the first user question in this Topic, append three concise, distinct questions the user may naturally ask next, in the user's language. Put them only at the end of that first final answer, not in intermediate tool steps or later replies. Each question must deepen understanding of the answer, be at most 160 characters, and avoid unsolicited source changes or workflow actions. The UI turns them into editable drafts; never answer or send them automatically. Emit a JSON array inside this exact block, without a code fence or prose after it:\n<citeciter-next-questions>\n[\"\u95EE\u9898\u4E00\uFF1F\",\"\u95EE\u9898\u4E8C\uFF1F\",\"\u95EE\u9898\u4E09\uFF1F\"]\n</citeciter-next-questions>";
/** Live preference overrides stale route instructions in Topic history without suppressing ordinary coding plans. */
export declare function learningRoutePrompt(enabled: boolean): string;
/**
 * Compose the Topic system prompt section. Citations never appear here; they reach
 * the model only as references the user submitted.
 * @param custom - optional user teaching preferences.
 * @param followups - whether the first answer may end with suggested follow-up questions.
 * @param learningRoute - whether the optional learning route is enabled.
 * @returns the complete section text.
 */
export declare function composeHostedTopicPrompt(custom: string | undefined, followups: boolean, learningRoute?: boolean): string;
