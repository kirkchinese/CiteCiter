import { z } from "zod";
import parse from "semver/functions/parse.js";
//#region lib/types/draft-contract.js
/** Persisted drafts are user work, never model input until explicitly submitted. */
const draftReferenceSchema = z.object({
	id: z.string().min(1).max(500),
	kind: z.enum([
		"source",
		"excerpt",
		"board"
	]),
	label: z.string().max(1e3),
	content: z.string().max(5e5),
	address: z.string().max(4e3).optional()
}).strict();
const draftFileSchema = z.object({
	id: z.uuid(),
	name: z.string().min(1).max(1e3),
	type: z.string().max(200),
	size: z.number().int().nonnegative().max(104857600),
	lastModified: z.number().int().nonnegative()
}).strict();
const draftContentSchema = z.object({
	text: z.string().max(11e3),
	references: z.array(draftReferenceSchema).max(64),
	files: z.array(draftFileSchema).max(32)
}).strict();
const draftStateSchema = z.object({
	version: z.literal(1),
	revision: z.number().int().nonnegative(),
	content: draftContentSchema,
	pending: z.object({
		requestId: z.uuid(),
		content: draftContentSchema
	}).strict().nullable()
}).strict();
const EMPTY_DRAFT_STATE = {
	version: 1,
	revision: 0,
	content: {
		text: "",
		references: [],
		files: []
	},
	pending: null
};
const DRAFT_CHUNK_BYTES = 262144;
/** Remove only the acknowledged submission, preserving edits made while it was pending. */
function subtractSubmitted(current, submitted) {
	return {
		text: current.text === submitted.text ? "" : current.text,
		references: current.references.filter((item) => !submitted.references.some((sent) => sent.id === item.id)),
		files: current.files.filter((item) => !submitted.files.some((sent) => sent.id === item.id))
	};
}
//#endregion
//#region lib/types/question-draft-contract.js
/** Question identities are opaque values, never filesystem paths. */
const questionDraftKeySchema = z.string().min(1).max(2e3);
/** Partial answers preserve custom text verbatim, including whitespace and code indentation. */
const questionDraftAnswerSchema = z.object({
	selected: z.array(z.string().max(4e3)).max(128),
	custom: z.string().max(1e5)
}).strict();
const questionDraftContentSchema = z.object({
	answers: z.record(z.string().min(1).max(1e3), questionDraftAnswerSchema).refine((answers) => Object.keys(answers).length <= 128, "Too many question drafts"),
	page: z.number().int().nonnegative().max(127),
	edited: z.boolean(),
	held: z.boolean()
}).strict();
/** A per-question CAS revision, independent from the ordinary message draft. */
const questionDraftStateSchema = z.object({
	version: z.literal(1),
	revision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1),
	content: questionDraftContentSchema
}).strict();
const EMPTY_QUESTION_DRAFT_STATE = {
	version: 1,
	revision: 0,
	content: {
		answers: {},
		page: 0,
		edited: false,
		held: false
	}
};
/** Closed tombstones prevent delayed saves from recreating an accepted or ended question. */
const questionDraftRecordSchema = z.object({
	key: questionDraftKeySchema,
	closed: z.boolean(),
	/** Set only by the owning Host while observing a legacy blocking ask invocation. */
	blocking: z.boolean().optional(),
	state: questionDraftStateSchema
}).strict().refine((record) => !record.closed || Object.keys(record.state.content.answers).length === 0 && record.state.content.page === 0 && !record.state.content.edited && !record.state.content.held, "Closed question drafts must be empty");
//#endregion
//#region lib/types/native-session-contract.js
const attachmentId = z.string().min(1).transform((value) => value);
const nativeImageSchema = z.object({
	attachmentId,
	mediaType: z.enum([
		"image/png",
		"image/jpeg",
		"image/webp",
		"image/gif"
	]),
	bytes: z.number().int().nonnegative(),
	width: z.number().int().positive(),
	height: z.number().int().positive(),
	name: z.string().optional(),
	originalDimensions: z.object({
		width: z.number().int().positive(),
		height: z.number().int().positive()
	}).strict().optional()
}).strict().transform(({ name, originalDimensions, ...image }) => ({
	...image,
	...name === void 0 ? {} : { name },
	...originalDimensions === void 0 ? {} : { originalDimensions }
}));
const file = z.object({
	attachmentId,
	name: z.string(),
	bytes: z.number().int().nonnegative()
}).strict();
/** Wire reference for an authorized attachment; generic files have no image metadata. */
const nativeAttachmentRefSchema = z.union([nativeImageSchema, file]);
const nativeAttachmentSchema = z.discriminatedUnion("type", [z.object({
	type: z.literal("image"),
	attachment: nativeImageSchema
}).strict(), z.object({
	type: z.literal("file"),
	attachment: file
}).strict()]);
/** Read-only control projection. The Agent inbox remains the only authoritative queue. */
const nativeStateSchema = z.object({
	modelSelectionRequired: z.boolean().optional(),
	running: z.boolean(),
	blank: z.boolean(),
	error: z.string().nullable(),
	queue: z.array(z.object({
		id: z.string().min(1),
		placement: z.enum([
			"queued",
			"steering",
			"context"
		]),
		rpcId: z.string().optional(),
		text: z.string(),
		attachments: z.array(nativeAttachmentSchema)
	}).strict()),
	receipts: z.array(z.object({
		requestId: z.string().min(1),
		attachments: z.array(nativeAttachmentSchema)
	}).strict())
}).strict();
/** Maximum combined UTF-8 element-content bytes retained on one board. */
const BOARD_MAX_CONTENT_BYTES = 5e5;
/** Element kinds the blackboard renders safely on the chalk canvas. */
const boardElementKindSchema = z.enum([
	"text",
	"markdown",
	"math",
	"svg",
	"html",
	"image",
	"table"
]);
const boardColorValueSchema = z.string().max(80).regex(/^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+|(rgb|rgba|hsl|hsla)\([\d\s,.%()/-]+\))$/u);
const boardFontSizeSchema = z.string().max(20).regex(/^[\d.]+(px|em|rem|%)$/u);
/** Style keys the board renderer applies directly as inline CSS properties. */
const boardStyleSchema = z.object({
	color: boardColorValueSchema.optional(),
	fontSize: boardFontSizeSchema.optional()
}).strict();
const boardElementIdSchema = z.string().min(1).max(80);
const boardContentSchema = z.string().min(1).max(2e5);
const boardImageContentSchema = z.string().max(2e5).regex(/^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/u);
const boardTableContentSchema = z.string().max(2e5).regex(/^\|[^\n]+\|(?:\r?\n\|[-: |]+\|)+(?:\r?\n\|[^\n]+\|)*$/u);
const boardAnimationSchema = z.enum([
	"fade-in",
	"slide-in",
	"pulse",
	"highlight"
]);
const boardPercentSchema = z.number().min(0).max(100);
const boardSizeSchema = z.number().min(.5).max(100);
const utf8Encoder = new TextEncoder();
function addEnvelopeIssues(value, context) {
	if (value.x + value.w > 100) context.addIssue({
		code: "custom",
		message: "x + w must be at most 100",
		path: ["w"]
	});
	if (value.y + value.h > 100) context.addIssue({
		code: "custom",
		message: "y + h must be at most 100",
		path: ["h"]
	});
}
function addContentIssues(kind, content, context) {
	if (kind === "image" && !boardImageContentSchema.safeParse(content).success) context.addIssue({
		code: "custom",
		message: "image content must be a data:image/...;base64 data URI",
		path: ["content"]
	});
	else if (kind === "table" && !boardTableContentSchema.safeParse(content).success) context.addIssue({
		code: "custom",
		message: "table content must be a Markdown table",
		path: ["content"]
	});
}
/** One deterministic blackboard command in canvas-percent coordinates. */
const boardOpSchema = z.discriminatedUnion("op", [
	z.object({ op: z.literal("clear") }).strict(),
	z.object({
		op: z.literal("set"),
		id: boardElementIdSchema,
		kind: boardElementKindSchema,
		content: boardContentSchema,
		x: boardPercentSchema,
		y: boardPercentSchema,
		w: boardSizeSchema,
		h: boardSizeSchema,
		style: boardStyleSchema.optional()
	}).strict(),
	z.object({
		op: z.literal("update"),
		id: boardElementIdSchema,
		content: boardContentSchema.optional(),
		x: boardPercentSchema.optional(),
		y: boardPercentSchema.optional(),
		w: boardSizeSchema.optional(),
		h: boardSizeSchema.optional(),
		style: boardStyleSchema.optional()
	}).strict(),
	z.object({
		op: z.literal("remove"),
		id: boardElementIdSchema
	}).strict(),
	z.object({
		op: z.literal("clear_region"),
		x: boardPercentSchema,
		y: boardPercentSchema,
		w: boardSizeSchema,
		h: boardSizeSchema
	}).strict(),
	z.object({
		op: z.literal("animate"),
		id: boardElementIdSchema,
		animation: boardAnimationSchema,
		durationMs: z.number().int().min(50).max(5e3).optional(),
		iterations: z.number().int().min(1).max(5).optional()
	}).strict(),
	z.object({
		op: z.literal("focus"),
		id: boardElementIdSchema.nullable()
	}).strict()
]).superRefine((op, context) => {
	if (op.op === "set") {
		addEnvelopeIssues(op, context);
		addContentIssues(op.kind, op.content, context);
		return;
	}
	if (op.op === "clear_region") {
		addEnvelopeIssues(op, context);
		return;
	}
	if (op.op !== "update") return;
	if (!(op.content !== void 0 || op.x !== void 0 || op.y !== void 0 || op.w !== void 0 || op.h !== void 0) && (op.style === void 0 || Object.keys(op.style).length === 0)) context.addIssue({
		code: "custom",
		message: "update must change content, envelope, or style"
	});
});
/** One validated, non-empty atomic blackboard commit. */
const boardBatchSchema = z.array(boardOpSchema).min(1).max(50);
const boardElementStateSchema = z.object({
	id: boardElementIdSchema,
	kind: boardElementKindSchema,
	content: boardContentSchema,
	x: boardPercentSchema,
	y: boardPercentSchema,
	w: boardSizeSchema,
	h: boardSizeSchema,
	style: boardStyleSchema,
	focused: z.boolean(),
	animation: z.object({
		name: boardAnimationSchema,
		durationMs: z.number().int().min(50).max(5e3),
		iterations: z.number().int().min(1).max(5),
		run: z.number().int().positive()
	}).strict().optional()
}).strict().superRefine((element, context) => {
	addEnvelopeIssues(element, context);
	addContentIssues(element.kind, element.content, context);
});
/** Empty immutable input for the first board commit. */
const EMPTY_BOARD_STATE = /* @__PURE__ */ new Map();
function intersects(left, right) {
	return left.x < right.x + right.w && left.x + left.w > right.x && left.y < right.y + right.h && left.y + left.h > right.y;
}
function assertElementFits(element) {
	boardElementStateSchema.parse(element);
}
function assertBoardBudget(state) {
	if (state.size > 50) throw new Error(`board cannot retain more than 50 elements`);
	let contentBytes = 0;
	for (const element of state.values()) contentBytes += utf8Encoder.encode(element.content).byteLength;
	if (contentBytes > 5e5) throw new Error(`board content cannot exceed ${BOARD_MAX_CONTENT_BYTES} UTF-8 bytes`);
}
/**
* Apply one validated op batch atomically to the current board state.
* @param state - current element map.
* @param ops - validated, non-empty ops in application order.
* @returns the new state and the number of applied ops.
*/
function applyBoardOps(state, ops) {
	if (ops.length === 0) throw new Error("board commit must contain at least one op");
	if (ops.length > 50) throw new Error(`board commit cannot exceed 50 ops`);
	const next = new Map(state);
	for (const op of ops) switch (op.op) {
		case "clear":
			next.clear();
			break;
		case "set": {
			const element = {
				id: op.id,
				kind: op.kind,
				content: op.content,
				x: op.x,
				y: op.y,
				w: op.w,
				h: op.h,
				style: op.style ?? {},
				focused: false
			};
			assertElementFits(element);
			next.set(op.id, element);
			break;
		}
		case "update": {
			const current = next.get(op.id);
			if (current === void 0) throw new Error(`cannot update unknown board element ${op.id}`);
			const element = {
				...current,
				...op.content === void 0 ? {} : { content: op.content },
				...op.x === void 0 ? {} : { x: op.x },
				...op.y === void 0 ? {} : { y: op.y },
				...op.w === void 0 ? {} : { w: op.w },
				...op.h === void 0 ? {} : { h: op.h },
				...op.style === void 0 ? {} : { style: {
					...current.style,
					...op.style
				} }
			};
			assertElementFits(element);
			next.set(op.id, element);
			break;
		}
		case "animate": {
			const current = next.get(op.id);
			if (current === void 0) throw new Error(`cannot animate unknown board element ${op.id}`);
			next.set(op.id, {
				...current,
				animation: {
					name: op.animation,
					durationMs: op.durationMs ?? 500,
					iterations: op.iterations ?? 1,
					run: (current.animation?.run ?? 0) + 1
				}
			});
			break;
		}
		case "focus":
			if (op.id !== null && !next.has(op.id)) throw new Error(`cannot focus unknown board element ${op.id}`);
			for (const [id, element] of next) {
				const focused = id === op.id;
				if (element.focused !== focused) next.set(id, {
					...element,
					focused
				});
			}
			break;
		case "remove":
			next.delete(op.id);
			break;
		case "clear_region":
			for (const [id, element] of next) if (intersects(element, op)) next.delete(id);
			break;
		default: return op;
	}
	assertBoardBudget(next);
	return {
		state: next,
		revision: ops.length
	};
}
/** Snapshot field containing only the final projected board state. */
const boardSnapshotSchema = z.object({
	version: z.literal(4),
	revision: z.number().int().nonnegative(),
	elements: z.array(boardElementStateSchema).max(50),
	invalid: z.number().int().nonnegative()
}).strict();
Object.freeze({
	version: 4,
	revision: 0,
	elements: [],
	invalid: 0
});
//#endregion
//#region lib/types/board-capture-protocol.js
/** Immutable board revision requested by one real model tool call, independent of UI selection. */
const boardCaptureJobSchema = z.object({
	id: z.string().min(1),
	sessionId: z.string().min(1),
	board: boardSnapshotSchema
}).strict();
//#endregion
//#region lib/types/learning-example.js
/** Shared contract for model input and persisted card examples. Code is never Markdown. */
const descriptions = {
	text: "A prose example in Markdown, at most 1500 characters. Use the code variant for source code.",
	code: "Raw source code, at most 1500 characters. Preserve line breaks and indentation; do not add Markdown fences.",
	language: "Language identifier such as javascript, python, html or text; 1–40 letters, digits, underscores, plus signs, dots, hashes or hyphens."
};
const learningExampleSchema = z.discriminatedUnion("kind", [z.object({
	kind: z.literal("text"),
	content: z.string().trim().min(1).max(1500).describe(descriptions.text)
}).strict(), z.object({
	kind: z.literal("code"),
	content: z.string().min(1).max(1500).refine((value) => value.trim().length > 0, "Code must not be blank").describe(descriptions.code),
	language: z.string().regex(/^[a-zA-Z0-9_+#.-]{1,40}$/).describe(descriptions.language)
}).strict()]);
/** Native DSH tool schema; kept beside the validator to expose the same tagged contract. */
const LEARNING_EXAMPLE_PARAMETER = {
	required: true,
	description: "Choose text for prose or code for literal source code.",
	oneOf: [{
		type: "object",
		additionalProperties: false,
		properties: {
			kind: {
				type: "string",
				enum: ["text"],
				required: true
			},
			content: {
				type: "string",
				required: true,
				description: descriptions.text
			}
		}
	}, {
		type: "object",
		additionalProperties: false,
		properties: {
			kind: {
				type: "string",
				enum: ["code"],
				required: true
			},
			content: {
				type: "string",
				required: true,
				description: descriptions.code
			},
			language: {
				type: "string",
				required: true,
				description: descriptions.language
			}
		}
	}]
};
//#endregion
//#region lib/types/learning.js
/** User-selected teaching stages; these indicate intent, never measured mastery. */
const LEARNING_STAGES = [
	{
		id: "logic",
		label: "底层逻辑",
		shortLabel: "逻辑",
		hint: "从定义、成立条件和因果机制讲起。",
		instruction: "请讲清当前主题的底层逻辑：先给出定义和成立条件，再解释因果机制与为什么成立。区分来源证据、一般知识和假设。只讲这一阶段，不自动推进。"
	},
	{
		id: "qualitative",
		label: "定性分析",
		shortLabel: "定性",
		hint: "看方向、边界，以及改变条件会发生什么。",
		instruction: "请对当前主题做定性分析：解释变量或因素之间的关系、变化方向、边界与反例，用一个具体情境说明。只讲这一阶段，不自动推进。"
	},
	{
		id: "quantitative",
		label: "定量分析（板书）",
		shortLabel: "定量",
		hint: "把变量、推导和算例写到板书上。",
		instruction: "请对当前主题做定量分析，并调用 blackboard_apply 整理板书：注明变量、单位、假设、推导步骤与一个可核查算例。示例数值必须标明是假设，不得伪造来源数据。如果此主题不适合定量或信息不足，请明确说明原因。只讲这一阶段，不自动推进。"
	},
	{
		id: "connections",
		label: "概念关联",
		shortLabel: "关联",
		hint: "说明它与哪些概念相连，以及为什么。",
		instruction: "请围绕当前主题给出 2–4 个最有帮助的概念关联，逐一解释是前提、推论、类比还是对比，说明关联理由与类比的边界。需要时用板书画关系。只讲这一阶段，不自动推进。"
	},
	{
		id: "summary",
		label: "总结学习卡片",
		shortLabel: "总结",
		hint: "先核对与纠错，再整理成学习卡片。",
		instruction: "请先核对本 Topic 的结论与已有板书：检查定义、成立条件、推导、数值和前后矛盾，不要把此前的模型回答当作证据；必要时读取可用来源。纠正发现的错误，将无法核实的内容明确标为“未核实”或省略，不要补造来源与定位。然后调用 learning_cards 生成 1–6 张学习卡片，每张包含核心结论、一个具体例子、可选自测问题和参考答案；逐项检查这些字段的一致性，纠错必须同步到例子和参考答案。涉及来源事实时保留真实可用的定位，区分来源证据与一般知识。完成后简短说明纠正了什么、还有哪些内容未核实；不安排复习计划。"
	}
];
/** Make the entire stage instruction visible and durable as an ordinary Topic user message. */
function learningQuestion(stageId, question = "") {
	const stage = LEARNING_STAGES.find((candidate) => candidate.id === stageId);
	return `【学习阶段：${stage.label}】\n${stage.instruction}${question.trim() === "" ? "" : `\n\n我的问题：${question.trim()}`}`;
}
/** The validation schema and model-visible native tool must expose the same field contract. */
const LEARNING_CARD_FIELD_DESCRIPTIONS = {
	title: "Non-empty title, at most 100 characters.",
	summary: "Markdown summary, at most 2000 characters. Separate independent points with lists or paragraphs; include conditions and corrections.",
	question: "Non-empty self-test question, at most 500 characters.",
	answer: "Markdown reference answer, at most 2000 characters, consistent with the summary and example. Fence multiline code."
};
const learningCardSchema = z.object({
	title: z.string().trim().min(1).max(100).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.title),
	summary: z.string().trim().min(1).max(2e3).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.summary),
	example: learningExampleSchema,
	question: z.string().trim().min(1).max(500).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.question),
	answer: z.string().trim().min(1).max(2e3).describe(LEARNING_CARD_FIELD_DESCRIPTIONS.answer)
}).strict();
const learningCardsInputSchema = z.object({ cards: z.array(learningCardSchema).min(1).max(8) }).strict();
z.object({ cards: z.array(learningCardSchema.extend({ example: z.union([learningExampleSchema, z.string().trim().min(1).max(1500).transform((content) => ({
	kind: "text",
	content
}))]) })).min(1).max(8) }).strict();
//#endregion
//#region lib/types/actions.js
/**
* One persisted wheel slot; its prompt is sent as a durable user message.
* Fields saved by older versions, such as `scenario`, are dropped when read.
*/
const citeActionSchema = z.object({
	label: z.string().trim().min(1).max(20),
	prompt: z.string().max(4e3),
	ask: z.boolean(),
	presentation: z.enum(["side", "floating"]),
	target: z.enum(["current", "new"]).optional()
}).refine((action) => action.ask || action.prompt.trim() !== "", "直接执行的模式需要提示词");
const wheelSlotsSchema = z.array(citeActionSchema.nullable()).length(8);
const wheelTriggerSchema = z.enum([
	"right-button",
	"Alt",
	"Control",
	"Shift",
	"Meta"
]);
const actionModelSchema = z.object({
	provider: z.string().min(1).max(200),
	model: z.string().min(1).max(200)
}).strict();
/** Clockwise from twelve o'clock. Empty slots retain their positions. */
const DEFAULT_WHEEL_SLOTS = [
	{
		label: "自由提问",
		prompt: "",
		ask: true,
		presentation: "side",
		target: "current"
	},
	{
		label: "解释这段",
		prompt: learningQuestion("logic"),
		ask: false,
		presentation: "side"
	},
	{
		label: "找错误",
		prompt: "请审查引用内容的错误、遗漏和成立条件。区分可确认的错误与需要补充的信息。",
		ask: false,
		presentation: "floating"
	},
	{
		label: "翻译",
		prompt: "请将引用内容翻译为中文，保留重要术语的原文。",
		ask: false,
		presentation: "floating"
	},
	{
		label: "定量板书",
		prompt: learningQuestion("quantitative"),
		ask: false,
		presentation: "side"
	},
	{
		label: "总结卡片",
		prompt: learningQuestion("summary", "围绕本次引用的内容整理。"),
		ask: false,
		presentation: "side"
	},
	null,
	null
];
/** Slots saved before targets existed append only when they are the unchanged built-in free question. */
function actionTarget(action) {
	if (action.target !== void 0) return action.target;
	return action.label === "自由提问" && action.prompt === "" && action.ask && action.presentation === "side" ? "current" : "new";
}
//#endregion
//#region lib/types/tool-outcome-contract.js
/** Recognized question outcomes shared by Host and Client without importing either service face. */
const QUESTION_TOOL_OUTCOME_CODES = ["ASK_CANCELLED", "ASK_ABORTED"];
//#endregion
//#region lib/types/question-reply.js
/** Client-safe presentation of a durable late answer; the original model payload stays in the Session log. */
const questionReplySchema = z.object({
	callId: z.string().min(1),
	items: z.array(z.object({
		id: z.string().min(1),
		question: z.string(),
		header: z.string().optional(),
		values: z.array(z.string())
	}).strict())
}).strict();
const payloadSchema = z.object({
	kind: z.literal("answer_to_pending_question"),
	tool: z.literal("ask_user_question"),
	callId: z.string(),
	questions: z.array(z.object({
		id: z.string().min(1),
		question: z.string(),
		header: z.string().optional()
	})).min(1),
	answers: z.array(z.object({
		id: z.string().min(1),
		selected: z.array(z.string()),
		custom: z.string().optional()
	}))
});
/**
* Read the official late-answer payload at the persisted-data boundary.
* @param text - Text of one committed user-question-reply message.
* @param callId - Identity from the message source, which the payload must match.
* @returns Question/answer pairs, or an empty presentation for unreadable history; never raw internal JSON.
*/
function readQuestionReply(text, callId) {
	const unreadable = {
		callId,
		items: []
	};
	let value;
	try {
		value = JSON.parse(text);
	} catch {
		return unreadable;
	}
	const parsed = payloadSchema.safeParse(value);
	if (!parsed.success || parsed.data.callId !== callId) return unreadable;
	const { questions, answers } = parsed.data;
	const byId = new Map(answers.map((answer) => [answer.id, answer]));
	if (new Set(questions.map((question) => question.id)).size !== questions.length || byId.size !== answers.length || questions.length !== answers.length || questions.some((question) => !byId.has(question.id))) return unreadable;
	return {
		callId,
		items: questions.map((question) => {
			const answer = byId.get(question.id);
			const custom = answer.custom ?? "";
			return {
				...question,
				values: [...answer.selected, ...custom.trim() === "" ? [] : [custom]]
			};
		})
	};
}
/** Human-readable transcript text for copying and other plain-text consumers. */
function questionReplyText(reply) {
	if (reply.items.length === 0) return "已补答；这条历史回答的格式无法解析。";
	return "补答\n\n" + reply.items.map((item) => `${item.question}\n${item.values.length === 0 ? "已跳过" : `回答：${item.values.join("、")}`}`).join("\n\n");
}
/** Host settings namespace mirrored by the browser settings scope. */
const CITECITER_SETTINGS_NAMESPACE = "citeciter";
/** Topic-scoped system prompt section. */
const TUTOR_SECTION_NAME = "@kirkchinese/dsh-citeciter:tutor";
/**
* Historical on-disk fields. Every Topic is now an Observer Topic; Exact Fork
* values and scenarios remain readable in metadata written before 0.9.
*/
const topicModeSchema = z.enum(["observer", "exact-fork"]);
const topicScenarioSchema = z.enum([
	"qa",
	"present",
	"read",
	"investigate"
]);
/** User preferences applied to new Topics, source reads and the browser panel. */
const citeCiterSettingsSchema = z.object({
	includeSourceReasoning: z.boolean(),
	panelWidthPercent: z.number().int().min(28).max(55),
	reopenLastTopic: z.boolean(),
	tutorPrompt: z.string().max(4e3).optional(),
	followupQuestions: z.boolean().optional(),
	shortcutOpenPanel: z.string().max(40).optional(),
	boardAnimations: z.boolean().optional(),
	activeRecall: z.boolean().optional(),
	updateNotifications: z.boolean().optional(),
	wheelSlots: wheelSlotsSchema.optional(),
	wheelTrigger: wheelTriggerSchema.optional(),
	defaultCiterModel: actionModelSchema.nullable().optional(),
	defaultPermission: z.enum([
		"read-only",
		"workspace-write",
		"danger-full-access"
	]).optional(),
	learningRoute: z.boolean().optional()
}).strict();
/** Settings used before an optional DSH settings provider becomes available. */
const DEFAULT_CITECITER_SETTINGS = Object.freeze({
	includeSourceReasoning: true,
	panelWidthPercent: 34,
	reopenLastTopic: true,
	followupQuestions: true,
	boardAnimations: true,
	activeRecall: false,
	defaultPermission: "read-only",
	learningRoute: false,
	updateNotifications: true
});
/**
* Read persisted settings field by field. Keys written by other versions are
* ignored, and an invalid value falls back to its default without discarding the rest.
* @param raw - settings value from the Host configuration.
* @returns complete settings for this version.
*/
function readCiteCiterSettings(raw) {
	const input = typeof raw === "object" && raw !== null && !Array.isArray(raw) ? raw : {};
	const settings = { ...DEFAULT_CITECITER_SETTINGS };
	for (const [key, field] of Object.entries(citeCiterSettingsSchema.shape)) {
		if (input[key] === void 0) continue;
		const parsed = field.safeParse(input[key]);
		if (parsed.success) settings[key] = parsed.data;
	}
	return settings;
}
/** Browser-visible selection resolved by the Host against one committed model call. */
const citationSelectionClaimSchema = z.object({
	sourceSessionId: z.string().min(1),
	anchorSeq: z.number().int().nonnegative(),
	displayText: z.string().min(1).max(32e3),
	sourceHintText: z.string().min(1).max(32e3).optional(),
	prefixText: z.string().max(1e3),
	suffixText: z.string().max(1e3)
}).strict();
/** Host-verifiable Markdown evidence plus the browser-visible quote used by the UI. */
const citationDraftSchema = z.object({
	sourceSessionId: z.string().min(1),
	anchorSeq: z.number().int().nonnegative(),
	startOffset: z.number().int().nonnegative(),
	endOffset: z.number().int().positive(),
	sourceText: z.string().min(1).max(32e3),
	displayText: z.string().min(1).max(32e3),
	prefixText: z.string().max(1e3),
	suffixText: z.string().max(1e3),
	selectionFingerprint: z.string().regex(/^[a-f0-9]{64}$/)
}).strict();
/**
* Evidence anchor discriminator for one durable Citation. `anchorSeq` mirrors
* the record-level coordinate; the canonical schema enforces equality.
*/
const citationEntrySchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("assistant-message"),
		anchorSeq: z.number().int().nonnegative()
	}).strict(),
	z.object({
		kind: z.literal("tool-result"),
		anchorSeq: z.number().int().nonnegative(),
		callId: z.string().min(1),
		toolName: z.string().min(1),
		projection: z.enum([
			"result-text",
			"terminal",
			"diff"
		]),
		fileIndex: z.number().int().nonnegative().optional(),
		side: z.enum(["old", "new"]).optional()
	}).strict(),
	z.object({
		kind: z.literal("document-range"),
		documentId: z.string().min(1),
		startOffset: z.number().int().nonnegative(),
		endOffset: z.number().int().positive()
	}).strict()
]);
/** Shared verified text projection carried by every Citation evidence record. */
const citationEvidenceFields = {
	sourceSessionId: z.string().min(1),
	anchorSeq: z.number().int().nonnegative(),
	startOffset: z.number().int().nonnegative(),
	endOffset: z.number().int().positive(),
	sourceText: z.string().min(1).max(32e3),
	displayText: z.string().min(1).max(32e3),
	prefixText: z.string().max(1e3),
	suffixText: z.string().max(1e3)
};
/** Canonical v4 Citation: the shared text projection plus one EvidenceRef entry. */
const citationRecordSchema = z.object({
	schemaVersion: z.literal(4),
	...citationEvidenceFields,
	entry: citationEntrySchema,
	selectionFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
	createdAt: z.number().int().nonnegative()
}).strict().superRefine((citation, context) => {
	if ("anchorSeq" in citation.entry && citation.entry.anchorSeq !== citation.anchorSeq) context.addIssue({
		code: "custom",
		message: "citation entry anchorSeq must equal the record anchorSeq",
		path: ["entry", "anchorSeq"]
	});
	if (citation.entry.kind === "document-range" && citation.anchorSeq !== 0) context.addIssue({
		code: "custom",
		message: "document EvidenceRef records must carry anchorSeq 0",
		path: ["anchorSeq"]
	});
});
/** On-disk Citation written by v3 (no entry) or v4. */
const citationRecordFileSchema = z.object({
	schemaVersion: z.union([z.literal(3), z.literal(4)]),
	...citationEvidenceFields,
	entry: citationEntrySchema.optional(),
	selectionFingerprint: z.string().regex(/^[a-f0-9]{64}$/),
	createdAt: z.number().int().nonnegative()
}).strict();
/**
* Normalize one durable Citation file record to canonical v4.
* @param raw - parsed v3 or v4 file record.
* @returns canonical v4 record; v3 synthesizes its assistant-message entry.
*/
function normalizeCitationRecord(raw) {
	if (raw.schemaVersion === 4) {
		if (raw.entry === void 0) throw new Error("CiteCiter Citation v4 is missing its evidence entry");
		const { entry, ...rest } = raw;
		return citationRecordSchema.parse({
			...rest,
			entry
		});
	}
	const { entry: _legacyEntry, ...rest } = raw;
	return citationRecordSchema.parse({
		...rest,
		schemaVersion: 4,
		entry: {
			kind: "assistant-message",
			anchorSeq: raw.anchorSeq
		}
	});
}
/**
* Parse a durable Citation written by v3 or v4.
* @param raw - stored Citation value.
* @returns canonical v4 CitationRecord.
*/
function parseCitationRecord(raw) {
	return normalizeCitationRecord(citationRecordFileSchema.parse(raw));
}
const modelConfigSchema = z.object({
	provider: z.string().min(1),
	model: z.string().min(1),
	reasoningEffort: z.string().optional(),
	temperature: z.number().finite().optional(),
	maxTokens: z.number().int().positive().optional(),
	stop: z.array(z.string()).optional()
}).strict();
/** Fields shared by the canonical Topic metadata schema and its on-disk reader. */
const topicMetadataFields = {
	modelSelectionRequired: z.boolean().optional(),
	hosted: z.boolean().optional(),
	storage: z.literal("source").optional(),
	topicId: z.number().int().positive(),
	createRequestId: z.string().min(1).optional(),
	sessionId: z.string().min(1),
	sourceSessionId: z.string().min(1),
	sourceCwd: z.string(),
	mode: topicModeSchema,
	modelConfig: modelConfigSchema,
	forkThroughSeq: z.number().int().nonnegative().nullable(),
	temporaryTitle: z.string().min(1).max(160),
	cachedTitle: z.string().min(1).max(240).nullable(),
	cachedTitleSource: z.enum([
		"fallback",
		"provider",
		"user"
	]).nullable(),
	cachedTitleEventSeq: z.number().int().nonnegative().nullable().optional(),
	createdAt: z.number().int().nonnegative(),
	updatedAt: z.number().int().nonnegative(),
	archivedAt: z.number().int().nonnegative().nullable(),
	sourceAvailable: z.boolean(),
	/** Cursor from this Topic's last source read, never the source horizon or a permission boundary. */
	observedThroughSeq: z.number().int().nonnegative().nullable().optional().describe("Last source-read scan cursor; not the source horizon or an access limit.")
};
/** Canonical Topic metadata committed by the current runtime. */
const topicMetadataSchema = z.object({
	schemaVersion: z.literal(2),
	...topicMetadataFields,
	citation: citationRecordSchema.nullable(),
	scenario: topicScenarioSchema,
	documentId: z.string().min(1).nullable()
}).strict();
/** v1 metadata always carries a Citation; scenario/document fields landed during that version. */
const topicMetadataV1FileSchema = z.object({
	schemaVersion: z.literal(1),
	...topicMetadataFields,
	citation: citationRecordFileSchema,
	scenario: topicScenarioSchema.optional(),
	documentId: z.string().min(1).nullable().optional()
}).strict();
/** v2 metadata distinguishes a selected Citation from a source-bound free Topic. */
const topicMetadataV2FileSchema = z.object({
	schemaVersion: z.literal(2),
	...topicMetadataFields,
	citation: citationRecordFileSchema.nullable(),
	scenario: topicScenarioSchema,
	documentId: z.string().min(1).nullable()
}).strict();
/**
* Parse one on-disk Topic metadata record, normalizing legacy v3 Citations and
* missing scenario/document fields to their current defaults.
* @param raw - stored metadata value.
* @returns canonical TopicMetadata.
*/
function parseTopicMetadataFile(raw) {
	const { citation, scenario, documentId, ...rest } = z.union([topicMetadataV1FileSchema, topicMetadataV2FileSchema]).parse(raw);
	return topicMetadataSchema.parse({
		...rest,
		schemaVersion: 2,
		citation: citation === null ? null : parseCitationRecord(citation),
		scenario: scenario ?? "qa",
		documentId: documentId ?? null
	});
}
const permissionSchema = z.enum([
	"read-only",
	"workspace-write",
	"danger-full-access"
]);
const topicSummarySchema = z.object({
	modelSelectionRequired: z.boolean().optional(),
	permission: permissionSchema.optional(),
	topicId: z.number().int().positive(),
	sessionId: z.string().min(1),
	sourceSessionId: z.string().min(1),
	documentId: z.string().min(1).nullable(),
	citation: citationRecordSchema.nullable(),
	title: z.string().min(1),
	titlePending: z.boolean(),
	createdAt: z.number().int().nonnegative(),
	updatedAt: z.number().int().nonnegative(),
	archived: z.boolean(),
	running: z.boolean(),
	sourceAvailable: z.boolean(),
	/** Cursor from this Topic's last source read, never the source horizon or a permission boundary. */
	observedThroughSeq: z.number().int().nonnegative().nullable().describe("Last source-read scan cursor; not the source horizon or an access limit."),
	modelConfig: modelConfigSchema
}).strict();
const messageAttachmentSchema = z.object({
	kind: z.enum(["image", "file"]),
	id: z.string().min(1),
	name: z.string()
}).strict();
const topicMessageIdentitySchema = {
	id: z.string().min(1),
	seq: z.number().int().nonnegative()
};
const topicMessageSchema = z.discriminatedUnion("role", [
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("user"),
		questionReply: questionReplySchema.optional(),
		attachments: z.array(messageAttachmentSchema).optional(),
		text: z.string()
	}).strict(),
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("assistant"),
		renderKey: z.string().optional(),
		text: z.string(),
		reasoning: z.string().nullable(),
		streaming: z.boolean()
	}).strict(),
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("context"),
		label: z.string().min(1),
		text: z.string()
	}).strict(),
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("tool"),
		questionReply: questionReplySchema.optional(),
		attachments: z.array(messageAttachmentSchema).optional(),
		name: z.string().min(1),
		arguments: z.string(),
		result: z.string().nullable(),
		isError: z.boolean(),
		errorCode: z.enum(QUESTION_TOOL_OUTCOME_CODES).optional(),
		approvalOutcome: z.literal("rejected").optional(),
		interruptionOutcome: z.literal("interrupted").optional(),
		running: z.boolean()
	}).strict(),
	z.object({
		...topicMessageIdentitySchema,
		role: z.literal("error"),
		text: z.string(),
		bodyRetained: z.boolean(),
		attempt: z.number().int().positive(),
		status: z.enum(["failed", "stopped"])
	}).strict()
]);
const questionOptionSchema = z.object({
	label: z.string().min(1),
	description: z.string().optional()
}).strict();
const questionItemSchema = z.object({
	id: z.string().min(1),
	question: z.string().min(1),
	header: z.string().optional(),
	detail: z.string().optional(),
	options: z.array(questionOptionSchema).optional(),
	multiSelect: z.boolean().optional()
}).strict();
const questionAnswerSchema = z.object({ answers: z.array(z.object({
	id: z.string().min(1),
	selected: z.array(z.string()),
	custom: z.string().optional()
}).strict()) }).strict();
const pendingQuestionSchema = z.object({
	key: z.string().min(1),
	questions: z.array(questionItemSchema).min(1),
	state: z.enum(["open", "continued"]).optional(),
	callId: z.string().min(1).optional(),
	timed: z.boolean().optional(),
	blocking: z.boolean().optional()
}).strict();
const topicSnapshotSchema = z.object({
	captureId: z.string().optional(),
	documentTitle: z.string().optional(),
	topic: topicSummarySchema,
	messages: z.array(topicMessageSchema),
	pendingQuestion: pendingQuestionSchema.nullable(),
	pendingQuestions: z.array(pendingQuestionSchema).optional(),
	error: z.string().nullable(),
	board: boardSnapshotSchema.optional()
}).strict();
const modelOptionSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	description: z.string().optional(),
	reasoningEfforts: z.array(z.object({
		id: z.string().min(1),
		name: z.string().min(1)
	}).strict())
}).strict();
const providerOptionSchema = z.object({
	id: z.string().min(1),
	name: z.string().min(1),
	models: z.array(modelOptionSchema)
}).strict();
const draftQuestionSchema = z.string().trim().max(12e3);
const questionSchema = z.string().trim().min(1).max(12e3);
const topicSessionIdSchema = z.string().min(1);
/** Whole-card tool-result claim; the Host verifies it against the committed `tool/result`. */
const toolEvidenceClaimSchema = z.object({
	sourceSessionId: z.string().min(1),
	callId: z.string().min(1),
	displayText: z.string().min(1).max(32e3),
	projection: z.enum([
		"result-text",
		"terminal",
		"diff"
	]).optional()
}).strict();
/** Browser-submitted claim that anchors one Topic on a CiteCiter document range. */
const documentEvidenceClaimSchema = z.object({
	sourceSessionId: z.string().min(1),
	documentId: z.string().min(1),
	displayText: z.string().min(1).max(32e3),
	prefixText: z.string().max(1e3),
	suffixText: z.string().max(1e3)
}).strict();
/** Document format accepted by the CiteCiter private document library. */
const documentFormatSchema = z.enum(["text", "markdown"]);
/** Document-library metadata exposed to the Reader and document Topics. */
const documentSummarySchema = z.object({
	documentId: z.string().min(1),
	title: z.string().trim().min(1).max(200),
	format: documentFormatSchema,
	size: z.number().int().nonnegative(),
	importedAt: z.number().int().nonnegative()
}).strict();
/** Bounded document content page returned to the Reader. */
const documentContentSchema = z.object({
	documentId: z.string().min(1),
	title: z.string().trim().min(1).max(200),
	format: documentFormatSchema,
	content: z.string(),
	truncated: z.boolean(),
	page: z.number().int().nonnegative().default(0),
	pageCount: z.number().int().positive().default(1)
}).strict();
const createFields = {
	action: z.literal("create"),
	modelRoute: actionModelSchema.optional(),
	requestId: z.string().min(1),
	question: draftQuestionSchema
};
/** Create a Topic bound to its source Session, optionally anchored on one piece of evidence the Host verifies. */
const createRequestSchema = z.union([
	z.object({
		...createFields,
		sourceSessionId: z.string().min(1)
	}).strict(),
	z.object({
		...createFields,
		selectionClaim: citationSelectionClaimSchema
	}).strict(),
	z.object({
		...createFields,
		toolClaim: toolEvidenceClaimSchema
	}).strict(),
	z.object({
		...createFields,
		documentClaim: documentEvidenceClaimSchema
	}).strict()
]);
/** One strict direct-RPC command for the private CiteCiter runtime. */
const citeCiterRequestSchema = z.union([createRequestSchema, z.discriminatedUnion("action", [
	z.object({
		action: z.literal("question-draft-get"),
		topicSessionId: topicSessionIdSchema,
		key: questionDraftKeySchema
	}).strict(),
	z.object({
		action: z.literal("question-draft-save"),
		topicSessionId: topicSessionIdSchema,
		key: questionDraftKeySchema,
		state: questionDraftStateSchema
	}).strict(),
	z.object({
		action: z.literal("draft-get"),
		topicSessionId: topicSessionIdSchema
	}).strict(),
	z.object({
		action: z.literal("draft-save"),
		topicSessionId: topicSessionIdSchema,
		state: draftStateSchema
	}).strict(),
	z.object({
		action: z.literal("draft-file-put"),
		topicSessionId: topicSessionIdSchema,
		file: draftFileSchema,
		offset: z.number().int().nonnegative(),
		data: z.string().max(349528).regex(/^[A-Za-z0-9+/]*={0,2}$/)
	}).strict(),
	z.object({
		action: z.literal("draft-file-get"),
		topicSessionId: topicSessionIdSchema,
		fileId: z.uuid(),
		offset: z.number().int().nonnegative()
	}).strict(),
	z.object({
		action: z.literal("list"),
		sourceSessionId: z.string().min(1),
		includeArchived: z.boolean().optional()
	}).strict(),
	z.object({
		action: z.literal("board-capture"),
		topicSessionId: topicSessionIdSchema,
		id: z.string().min(1),
		png: z.string().max(8e6).regex(/^[A-Za-z0-9+/]+={0,2}$/).optional(),
		error: z.string().max(500).optional()
	}).strict(),
	z.object({ action: z.literal("board-capture-pending") }).strict(),
	z.object({
		action: z.literal("get"),
		topicSessionId: topicSessionIdSchema
	}).strict(),
	z.object({
		action: z.literal("native-state"),
		topicSessionId: topicSessionIdSchema,
		requestIds: z.array(z.string().min(1).max(100)).max(32)
	}).strict(),
	z.object({
		action: z.literal("native-attachment"),
		topicSessionId: topicSessionIdSchema,
		attachmentId: z.string().min(1).max(200)
	}).strict(),
	z.object({
		action: z.literal("ask"),
		requestId: z.string().min(1).optional(),
		topicSessionId: topicSessionIdSchema,
		question: questionSchema
	}).strict(),
	z.object({
		action: z.literal("stop"),
		topicSessionId: topicSessionIdSchema
	}).strict(),
	z.object({
		action: z.literal("answer-question"),
		topicSessionId: topicSessionIdSchema,
		key: z.string().min(1),
		answer: questionAnswerSchema,
		draftRevision: z.number().int().nonnegative().max(Number.MAX_SAFE_INTEGER - 1).optional()
	}).strict(),
	z.object({
		action: z.literal("cancel-question"),
		topicSessionId: topicSessionIdSchema,
		key: z.string().min(1)
	}).strict(),
	z.object({
		action: z.literal("timeout-question"),
		topicSessionId: topicSessionIdSchema,
		key: z.string().min(1)
	}).strict(),
	z.object({
		action: z.literal("rename"),
		topicSessionId: topicSessionIdSchema,
		title: z.string().trim().min(1).max(240)
	}).strict(),
	z.object({
		action: z.literal("archive"),
		topicSessionId: topicSessionIdSchema,
		archived: z.boolean()
	}).strict(),
	z.object({
		action: z.literal("delete"),
		topicSessionId: topicSessionIdSchema,
		confirmSessionId: topicSessionIdSchema
	}).strict(),
	z.object({ action: z.literal("models") }).strict(),
	z.object({
		action: z.literal("set-permission"),
		topicSessionId: topicSessionIdSchema,
		mode: permissionSchema
	}).strict(),
	z.object({
		action: z.literal("set-model-route"),
		topicSessionId: topicSessionIdSchema,
		provider: z.string().min(1),
		model: z.string().min(1)
	}).strict(),
	z.object({
		action: z.literal("set-reasoning-effort"),
		topicSessionId: topicSessionIdSchema,
		reasoningEffort: z.string().min(1).nullable()
	}).strict(),
	z.object({
		action: z.literal("document-import"),
		requestId: z.string().min(1).optional(),
		title: z.string().trim().min(1).max(200),
		format: documentFormatSchema,
		content: z.string().min(1).max(2e6)
	}).strict(),
	z.object({ action: z.literal("documents") }).strict(),
	z.object({
		action: z.literal("document-get"),
		documentId: z.string().min(1),
		page: z.number().int().nonnegative().optional()
	}).strict()
])]);
/** Strict response union returned by the single Remote command endpoint. */
const citeCiterResponseSchema = z.discriminatedUnion("kind", [
	z.object({
		kind: z.literal("question-draft"),
		state: questionDraftStateSchema,
		conflict: z.boolean(),
		closed: z.boolean()
	}).strict(),
	z.object({
		kind: z.literal("draft"),
		state: draftStateSchema,
		conflict: z.boolean()
	}).strict(),
	z.object({ kind: z.literal("draft-file-saved") }).strict(),
	z.object({
		kind: z.literal("draft-file"),
		data: z.string().max(349528).regex(/^[A-Za-z0-9+/]*={0,2}$/)
	}).strict(),
	z.object({
		kind: z.literal("board-captures"),
		jobs: z.array(boardCaptureJobSchema)
	}).strict(),
	z.object({ kind: z.literal("board-capture-accepted") }).strict(),
	z.object({
		kind: z.literal("native-state"),
		state: nativeStateSchema
	}).strict(),
	z.object({
		kind: z.literal("native-attachment"),
		attachment: nativeAttachmentRefSchema,
		data: z.string().regex(/^[A-Za-z0-9+/]*={0,2}$/)
	}).strict(),
	z.object({
		kind: z.literal("topic"),
		topic: topicSnapshotSchema
	}).strict(),
	z.object({
		kind: z.literal("topics"),
		topics: z.array(topicSummarySchema)
	}).strict(),
	z.object({
		kind: z.literal("models"),
		providers: z.array(providerOptionSchema)
	}).strict(),
	z.object({
		kind: z.literal("deleted"),
		sessionId: z.string().min(1),
		sourceSessionId: z.string().min(1),
		topicId: z.number().int().positive(),
		cleanup: z.enum(["complete", "pending"])
	}).strict(),
	z.object({
		kind: z.literal("document"),
		document: documentSummarySchema
	}).strict(),
	z.object({
		kind: z.literal("documents"),
		documents: z.array(documentSummarySchema)
	}).strict(),
	z.object({
		kind: z.literal("document-content"),
		document: documentContentSchema
	}).strict()
]);
/** Serialize the identity-bearing fields. Legacy drafts without an entry keep their v3 identity. */
function canonicalCitationIdentity(citation) {
	return JSON.stringify([
		citation.sourceSessionId,
		citation.anchorSeq,
		citation.startOffset,
		citation.endOffset,
		citation.sourceText,
		citation.displayText,
		citation.prefixText,
		citation.suffixText,
		...citation.entry === void 0 ? [] : [citation.entry]
	]);
}
//#endregion
//#region lib/types/package-version.js
/** Accept canonical package versions, including prerelease and build identifiers, without coercion. */
function parsePackageVersion(version) {
	const parsed = parse(version);
	if (parsed === null) return null;
	return parsed.version + (parsed.build.length > 0 ? `+${parsed.build.join(".")}` : "") === version ? parsed : null;
}
/** Validate an exact package version, not an npm tag, range or CLI argument. */
function isPackageVersion(version) {
	return parsePackageVersion(version) !== null;
}
/**
* Compare complete package versions using npm SemVer precedence; build metadata does not affect order.
* @param installed - installed package version.
* @param available - version selected by the registry tag; it may be a prerelease.
* @returns negative, zero or positive, or null when either input is not a canonical package version.
*/
function comparePackageVersions(installed, available) {
	const left = parsePackageVersion(installed);
	const right = parsePackageVersion(available);
	if (left === null || right === null) return null;
	const result = left.compare(right);
	return result < 0 ? -1 : result > 0 ? 1 : 0;
}
//#endregion
//#region lib/types/update.js
/** Bounded, read-only npm update check for the Web plugin. */
/** Fixed registry document used to resolve the installable `latest` version. */
const CITECITER_NPM_LATEST_URL = "https://registry.npmjs.org/@kirkchinese%2fdsh-citeciter/latest";
/** Successful checks remain fresh for six hours in one Host process. */
const UPDATE_CHECK_TTL_MS = 216e5;
const UPDATE_CHECK_TIMEOUT_MS = 5e3;
const UPDATE_RESPONSE_MAX_BYTES = 65536;
/** npm tags select versions; latest is not a guarantee that the selected version is stable. */
const packageVersionSchema = z.string().refine(isPackageVersion, "expected a canonical SemVer package version");
/** Stable failure identifiers consumed by the Web settings and notification UI. */
const updateCheckErrorCodeSchema = z.enum([
	"installed-version-invalid",
	"registry-timeout",
	"registry-network",
	"registry-http",
	"registry-response-too-large",
	"registry-response-invalid",
	"registry-version-invalid"
]);
/** Strict result of one read-only npm `latest` check. */
const updateCheckResponseSchema = z.discriminatedUnion("kind", [z.object({
	kind: z.literal("success"),
	installedVersion: packageVersionSchema,
	latestVersion: packageVersionSchema,
	updateAvailable: z.boolean(),
	checkedAt: z.number().int().nonnegative(),
	profile: z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/u).optional()
}).strict(), z.object({
	kind: z.literal("error"),
	code: updateCheckErrorCodeSchema,
	checkedAt: z.number().int().nonnegative()
}).strict()]);
const registryLatestSchema = z.object({ version: z.string() }).passthrough();
var UpdateFailure = class extends Error {
	code;
	constructor(code) {
		super(code);
		this.code = code;
	}
};
async function readInstalledVersion() {
	const [{ readFile }, { createRequire }] = await Promise.all([import("node:fs/promises"), import("node:module")]);
	const raw = await readFile(createRequire(import.meta.url).resolve("@kirkchinese/dsh-citeciter/package.json"), "utf8");
	const parsed = JSON.parse(raw);
	return z.object({ version: z.string() }).passthrough().parse(parsed).version;
}
async function cancelReader(reader) {
	try {
		await reader.cancel();
	} catch {}
}
async function cancelResponseBody(response) {
	try {
		await response.body?.cancel();
	} catch {}
}
async function readBoundedText(response, signal) {
	const declaredLength = response.headers.get("content-length");
	if (declaredLength !== null && /^\d+$/u.test(declaredLength) && Number(declaredLength) > UPDATE_RESPONSE_MAX_BYTES) {
		await cancelResponseBody(response);
		throw new UpdateFailure("registry-response-too-large");
	}
	if (response.body === null) return "";
	const reader = response.body.getReader();
	const decoder = new TextDecoder();
	let received = 0;
	let text = "";
	while (true) {
		signal.throwIfAborted();
		const chunk = await reader.read();
		if (chunk.done) break;
		received += chunk.value.byteLength;
		if (received > UPDATE_RESPONSE_MAX_BYTES) {
			await cancelReader(reader);
			throw new UpdateFailure("registry-response-too-large");
		}
		text += decoder.decode(chunk.value, { stream: true });
	}
	return text + decoder.decode();
}
/** Per-Host update checker with bounded I/O and a successful-result TTL cache. */
var UpdateChecker = class {
	fetchImpl;
	now;
	installedVersion;
	cached;
	inFlight;
	/**
	* @param fetchImpl - HTTPS transport; injectable for deterministic tests.
	* @param now - wall-clock provider used for response timestamps and cache expiry.
	* @param installedVersion - installed package-version reader.
	*/
	constructor(fetchImpl = globalThis.fetch, now = Date.now, installedVersion = readInstalledVersion) {
		this.fetchImpl = fetchImpl;
		this.now = now;
		this.installedVersion = installedVersion;
	}
	/**
	* Read npm's installable latest version without mutating the installation.
	* @param callerSignal - Remote caller cancellation.
	* @returns a strict success or stable classified failure.
	*/
	async check(callerSignal) {
		callerSignal.throwIfAborted();
		const now = this.now();
		if (this.cached !== void 0 && now < this.cached.expiresAt) return this.cached.response;
		if (this.inFlight === void 0) {
			const operation = this.checkFresh().finally(() => {
				if (this.inFlight === operation) this.inFlight = void 0;
			});
			this.inFlight = operation;
		}
		return waitForCaller(this.inFlight, callerSignal);
	}
	async checkFresh() {
		let installedVersion;
		try {
			installedVersion = await this.installedVersion();
		} catch {
			return {
				kind: "error",
				code: "installed-version-invalid",
				checkedAt: this.now()
			};
		}
		if (!packageVersionSchema.safeParse(installedVersion).success) return {
			kind: "error",
			code: "installed-version-invalid",
			checkedAt: this.now()
		};
		const timeoutSignal = AbortSignal.timeout(UPDATE_CHECK_TIMEOUT_MS);
		const signal = timeoutSignal;
		try {
			const response = await this.fetchImpl(CITECITER_NPM_LATEST_URL, {
				method: "GET",
				headers: { accept: "application/json" },
				redirect: "error",
				signal
			});
			if (!response.ok) {
				await cancelResponseBody(response);
				return {
					kind: "error",
					code: "registry-http",
					checkedAt: this.now()
				};
			}
			const text = await readBoundedText(response, signal);
			let raw;
			try {
				raw = JSON.parse(text);
			} catch {
				return {
					kind: "error",
					code: "registry-response-invalid",
					checkedAt: this.now()
				};
			}
			const latest = registryLatestSchema.safeParse(raw);
			if (!latest.success) return {
				kind: "error",
				code: "registry-response-invalid",
				checkedAt: this.now()
			};
			const comparison = comparePackageVersions(installedVersion, latest.data.version);
			if (comparison === null) return {
				kind: "error",
				code: "registry-version-invalid",
				checkedAt: this.now()
			};
			const checkedAt = this.now();
			const result = {
				kind: "success",
				installedVersion,
				latestVersion: latest.data.version,
				updateAvailable: comparison < 0,
				checkedAt
			};
			this.cached = {
				expiresAt: checkedAt + UPDATE_CHECK_TTL_MS,
				response: result
			};
			return result;
		} catch (error) {
			if (timeoutSignal.aborted) return {
				kind: "error",
				code: "registry-timeout",
				checkedAt: this.now()
			};
			if (error instanceof UpdateFailure) return {
				kind: "error",
				code: error.code,
				checkedAt: this.now()
			};
			return {
				kind: "error",
				code: "registry-network",
				checkedAt: this.now()
			};
		}
	}
};
function waitForCaller(operation, signal) {
	signal.throwIfAborted();
	return new Promise((resolve, reject) => {
		const onAbort = () => reject(signal.reason);
		signal.addEventListener("abort", onAbort, { once: true });
		operation.then(resolve, reject).finally(() => {
			signal.removeEventListener("abort", onAbort);
		});
	});
}
//#endregion
export { applyBoardOps as A, readQuestionReply as C, learningCardsInputSchema as D, LEARNING_CARD_FIELD_DESCRIPTIONS as E, DRAFT_CHUNK_BYTES as F, EMPTY_DRAFT_STATE as I, draftFileSchema as L, EMPTY_QUESTION_DRAFT_STATE as M, questionDraftKeySchema as N, LEARNING_EXAMPLE_PARAMETER as O, questionDraftRecordSchema as P, draftStateSchema as R, questionReplyText as S, actionTarget as T, readCiteCiterSettings as _, DEFAULT_CITECITER_SETTINGS as a, topicSnapshotSchema as b, citationDraftSchema as c, citeCiterRequestSchema as d, citeCiterResponseSchema as f, parseTopicMetadataFile as g, documentSummarySchema as h, CITECITER_SETTINGS_NAMESPACE as i, boardBatchSchema as j, EMPTY_BOARD_STATE as k, citationRecordSchema as l, documentEvidenceClaimSchema as m, updateCheckErrorCodeSchema as n, TUTOR_SECTION_NAME as o, documentContentSchema as p, updateCheckResponseSchema as r, canonicalCitationIdentity as s, UpdateChecker as t, citationSelectionClaimSchema as u, toolEvidenceClaimSchema as v, DEFAULT_WHEEL_SLOTS as w, topicSummarySchema as x, topicMetadataSchema as y, subtractSubmitted as z };
