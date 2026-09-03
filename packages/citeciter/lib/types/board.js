/** Shared blackboard protocol v4 and deterministic state folding. */
import { z } from 'zod';
/** Wire/version identity carried by every board snapshot. */
export const BOARD_PROTOCOL_VERSION = 4;
/** Maximum operations accepted in one atomic board commit. */
export const BOARD_MAX_BATCH_OPS = 50;
/** Maximum elements retained on one board. */
export const BOARD_MAX_ELEMENTS = 50;
/** Maximum combined UTF-8 element-content bytes retained on one board. */
export const BOARD_MAX_CONTENT_BYTES = 500_000;
/** Element kinds the blackboard renders safely on the chalk canvas. */
export const boardElementKindSchema = z.enum(['text', 'markdown', 'math', 'svg', 'html', 'image', 'table']);
const boardColorValueSchema = z.string().max(80).regex(/^(#[0-9a-fA-F]{3,8}|[a-zA-Z]+|(rgb|rgba|hsl|hsla)\([\d\s,.%()/-]+\))$/u);
const boardFontSizeSchema = z.string().max(20).regex(/^[\d.]+(px|em|rem|%)$/u);
/** Style keys the board renderer applies directly as inline CSS properties. */
export const boardStyleSchema = z.object({
    color: boardColorValueSchema.optional(),
    fontSize: boardFontSizeSchema.optional(),
}).strict();
const boardElementIdSchema = z.string().min(1).max(80);
const boardContentSchema = z.string().min(1).max(200_000);
const boardImageContentSchema = z.string().max(200_000).regex(/^data:image\/(?:png|jpeg|webp|gif|svg\+xml);base64,[A-Za-z0-9+/]+={0,2}$/u);
const boardTableContentSchema = z.string().max(200_000).regex(/^\|[^\n]+\|(?:\r?\n\|[-: |]+\|)+(?:\r?\n\|[^\n]+\|)*$/u);
const boardAnimationSchema = z.enum(['fade-in', 'slide-in', 'pulse', 'highlight']);
const boardPercentSchema = z.number().min(0).max(100);
const boardSizeSchema = z.number().min(0.5).max(100);
const utf8Encoder = new TextEncoder();
function addEnvelopeIssues(value, context) {
    if (value.x + value.w > 100) {
        context.addIssue({ code: 'custom', message: 'x + w must be at most 100', path: ['w'] });
    }
    if (value.y + value.h > 100) {
        context.addIssue({ code: 'custom', message: 'y + h must be at most 100', path: ['h'] });
    }
}
function addContentIssues(kind, content, context) {
    if (kind === 'image' && !boardImageContentSchema.safeParse(content).success) {
        context.addIssue({ code: 'custom', message: 'image content must be a data:image/...;base64 data URI', path: ['content'] });
    }
    else if (kind === 'table' && !boardTableContentSchema.safeParse(content).success) {
        context.addIssue({ code: 'custom', message: 'table content must be a Markdown table', path: ['content'] });
    }
}
/** One deterministic blackboard command in canvas-percent coordinates. */
export const boardOpSchema = z.discriminatedUnion('op', [
    z.object({ op: z.literal('clear') }).strict(),
    z.object({
        op: z.literal('set'),
        id: boardElementIdSchema,
        kind: boardElementKindSchema,
        content: boardContentSchema,
        x: boardPercentSchema,
        y: boardPercentSchema,
        w: boardSizeSchema,
        h: boardSizeSchema,
        style: boardStyleSchema.optional(),
    }).strict(),
    z.object({
        op: z.literal('update'),
        id: boardElementIdSchema,
        content: boardContentSchema.optional(),
        x: boardPercentSchema.optional(),
        y: boardPercentSchema.optional(),
        w: boardSizeSchema.optional(),
        h: boardSizeSchema.optional(),
        style: boardStyleSchema.optional(),
    }).strict(),
    z.object({ op: z.literal('remove'), id: boardElementIdSchema }).strict(),
    z.object({
        op: z.literal('clear_region'),
        x: boardPercentSchema,
        y: boardPercentSchema,
        w: boardSizeSchema,
        h: boardSizeSchema,
    }).strict(),
    z.object({
        op: z.literal('animate'),
        id: boardElementIdSchema,
        animation: boardAnimationSchema,
        durationMs: z.number().int().min(50).max(5000).optional(),
        iterations: z.number().int().min(1).max(5).optional(),
    }).strict(),
    z.object({ op: z.literal('focus'), id: boardElementIdSchema.nullable() }).strict(),
]).superRefine((op, context) => {
    if (op.op === 'set') {
        addEnvelopeIssues(op, context);
        addContentIssues(op.kind, op.content, context);
        return;
    }
    if (op.op === 'clear_region') {
        addEnvelopeIssues(op, context);
        return;
    }
    if (op.op !== 'update')
        return;
    const updatesContentOrEnvelope = op.content !== undefined
        || op.x !== undefined
        || op.y !== undefined
        || op.w !== undefined
        || op.h !== undefined;
    if (!updatesContentOrEnvelope && (op.style === undefined || Object.keys(op.style).length === 0)) {
        context.addIssue({ code: 'custom', message: 'update must change content, envelope, or style' });
    }
});
/** One validated, non-empty atomic blackboard commit. */
export const boardBatchSchema = z.array(boardOpSchema).min(1).max(BOARD_MAX_BATCH_OPS);
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
        durationMs: z.number().int().min(50).max(5000),
        iterations: z.number().int().min(1).max(5),
        run: z.number().int().positive(),
    }).strict().optional(),
}).strict().superRefine((element, context) => {
    addEnvelopeIssues(element, context);
    addContentIssues(element.kind, element.content, context);
});
/** Empty immutable input for the first board commit. */
export const EMPTY_BOARD_STATE = new Map();
function intersects(left, right) {
    return left.x < right.x + right.w
        && left.x + left.w > right.x
        && left.y < right.y + right.h
        && left.y + left.h > right.y;
}
function assertElementFits(element) {
    boardElementStateSchema.parse(element);
}
function assertBoardBudget(state) {
    if (state.size > BOARD_MAX_ELEMENTS) {
        throw new Error(`board cannot retain more than ${BOARD_MAX_ELEMENTS} elements`);
    }
    let contentBytes = 0;
    for (const element of state.values())
        contentBytes += utf8Encoder.encode(element.content).byteLength;
    if (contentBytes > BOARD_MAX_CONTENT_BYTES) {
        throw new Error(`board content cannot exceed ${BOARD_MAX_CONTENT_BYTES} UTF-8 bytes`);
    }
}
/**
 * Apply one validated op batch atomically to the current board state.
 * @param state - current element map.
 * @param ops - validated, non-empty ops in application order.
 * @returns the new state and the number of applied ops.
 */
export function applyBoardOps(state, ops) {
    if (ops.length === 0)
        throw new Error('board commit must contain at least one op');
    if (ops.length > BOARD_MAX_BATCH_OPS)
        throw new Error(`board commit cannot exceed ${BOARD_MAX_BATCH_OPS} ops`);
    const next = new Map(state);
    for (const op of ops) {
        switch (op.op) {
            case 'clear':
                next.clear();
                break;
            case 'set': {
                const element = {
                    id: op.id,
                    kind: op.kind,
                    content: op.content,
                    x: op.x,
                    y: op.y,
                    w: op.w,
                    h: op.h,
                    style: op.style ?? {},
                    focused: false,
                };
                assertElementFits(element);
                next.set(op.id, element);
                break;
            }
            case 'update': {
                const current = next.get(op.id);
                if (current === undefined)
                    throw new Error(`cannot update unknown board element ${op.id}`);
                const element = {
                    ...current,
                    ...(op.content === undefined ? {} : { content: op.content }),
                    ...(op.x === undefined ? {} : { x: op.x }),
                    ...(op.y === undefined ? {} : { y: op.y }),
                    ...(op.w === undefined ? {} : { w: op.w }),
                    ...(op.h === undefined ? {} : { h: op.h }),
                    ...(op.style === undefined ? {} : { style: { ...current.style, ...op.style } }),
                };
                assertElementFits(element);
                next.set(op.id, element);
                break;
            }
            case 'animate': {
                const current = next.get(op.id);
                if (current === undefined)
                    throw new Error(`cannot animate unknown board element ${op.id}`);
                next.set(op.id, {
                    ...current,
                    animation: {
                        name: op.animation,
                        durationMs: op.durationMs ?? 500,
                        iterations: op.iterations ?? 1,
                        run: (current.animation?.run ?? 0) + 1,
                    },
                });
                break;
            }
            case 'focus':
                if (op.id !== null && !next.has(op.id))
                    throw new Error(`cannot focus unknown board element ${op.id}`);
                for (const [id, element] of next) {
                    const focused = id === op.id;
                    if (element.focused !== focused)
                        next.set(id, { ...element, focused });
                }
                break;
            case 'remove':
                next.delete(op.id);
                break;
            case 'clear_region':
                for (const [id, element] of next) {
                    if (intersects(element, op))
                        next.delete(id);
                }
                break;
            default:
                return op;
        }
    }
    assertBoardBudget(next);
    return { state: next, revision: ops.length };
}
/** Snapshot field containing only the final projected board state. */
export const boardSnapshotSchema = z.object({
    version: z.literal(BOARD_PROTOCOL_VERSION),
    revision: z.number().int().nonnegative(),
    elements: z.array(boardElementStateSchema).max(BOARD_MAX_ELEMENTS),
    invalid: z.number().int().nonnegative(),
}).strict();
/** Empty snapshot used before any board commit. */
export const EMPTY_BOARD_SNAPSHOT = Object.freeze({
    version: BOARD_PROTOCOL_VERSION,
    revision: 0,
    elements: [],
    invalid: 0,
});
/**
 * Read renderable elements from one final-state snapshot.
 * @param snapshot - projected final board state.
 * @returns ordered elements plus the committed revision.
 */
export function foldBoardSnapshot(snapshot) {
    return { elements: snapshot.elements, revision: snapshot.revision };
}
/**
 * Fold a raw op list from first-set order; used by protocol tests.
 * @param ops - one validated op batch.
 * @returns final elements in insertion order.
 */
export function foldBoardElements(ops) {
    if (ops.length === 0)
        return [];
    return [...applyBoardOps(EMPTY_BOARD_STATE, ops).state.values()];
}
