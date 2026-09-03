/** Shared blackboard protocol v4 and deterministic state folding. */
import { z } from 'zod';
/** Wire/version identity carried by every board snapshot. */
export declare const BOARD_PROTOCOL_VERSION: 4;
/** Maximum operations accepted in one atomic board commit. */
export declare const BOARD_MAX_BATCH_OPS = 50;
/** Maximum elements retained on one board. */
export declare const BOARD_MAX_ELEMENTS = 50;
/** Maximum combined UTF-8 element-content bytes retained on one board. */
export declare const BOARD_MAX_CONTENT_BYTES = 500000;
/** Element kinds the blackboard renders safely on the chalk canvas. */
export declare const boardElementKindSchema: z.ZodEnum<{
    text: "text";
    markdown: "markdown";
    math: "math";
    svg: "svg";
    html: "html";
    image: "image";
    table: "table";
}>;
export type BoardElementKind = z.infer<typeof boardElementKindSchema>;
/** Style keys the board renderer applies directly as inline CSS properties. */
export declare const boardStyleSchema: z.ZodObject<{
    color: z.ZodOptional<z.ZodString>;
    fontSize: z.ZodOptional<z.ZodString>;
}, z.core.$strict>;
export type BoardStyle = z.infer<typeof boardStyleSchema>;
/** One deterministic blackboard command in canvas-percent coordinates. */
export declare const boardOpSchema: z.ZodDiscriminatedUnion<[z.ZodObject<{
    op: z.ZodLiteral<"clear">;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"set">;
    id: z.ZodString;
    kind: z.ZodEnum<{
        text: "text";
        markdown: "markdown";
        math: "math";
        svg: "svg";
        html: "html";
        image: "image";
        table: "table";
    }>;
    content: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    w: z.ZodNumber;
    h: z.ZodNumber;
    style: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
        fontSize: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"update">;
    id: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
    w: z.ZodOptional<z.ZodNumber>;
    h: z.ZodOptional<z.ZodNumber>;
    style: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
        fontSize: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"remove">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"clear_region">;
    x: z.ZodNumber;
    y: z.ZodNumber;
    w: z.ZodNumber;
    h: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"animate">;
    id: z.ZodString;
    animation: z.ZodEnum<{
        "fade-in": "fade-in";
        "slide-in": "slide-in";
        pulse: "pulse";
        highlight: "highlight";
    }>;
    durationMs: z.ZodOptional<z.ZodNumber>;
    iterations: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"focus">;
    id: z.ZodNullable<z.ZodString>;
}, z.core.$strict>], "op">;
export type BoardOp = z.infer<typeof boardOpSchema>;
/** One validated, non-empty atomic blackboard commit. */
export declare const boardBatchSchema: z.ZodArray<z.ZodDiscriminatedUnion<[z.ZodObject<{
    op: z.ZodLiteral<"clear">;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"set">;
    id: z.ZodString;
    kind: z.ZodEnum<{
        text: "text";
        markdown: "markdown";
        math: "math";
        svg: "svg";
        html: "html";
        image: "image";
        table: "table";
    }>;
    content: z.ZodString;
    x: z.ZodNumber;
    y: z.ZodNumber;
    w: z.ZodNumber;
    h: z.ZodNumber;
    style: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
        fontSize: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"update">;
    id: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
    x: z.ZodOptional<z.ZodNumber>;
    y: z.ZodOptional<z.ZodNumber>;
    w: z.ZodOptional<z.ZodNumber>;
    h: z.ZodOptional<z.ZodNumber>;
    style: z.ZodOptional<z.ZodObject<{
        color: z.ZodOptional<z.ZodString>;
        fontSize: z.ZodOptional<z.ZodString>;
    }, z.core.$strict>>;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"remove">;
    id: z.ZodString;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"clear_region">;
    x: z.ZodNumber;
    y: z.ZodNumber;
    w: z.ZodNumber;
    h: z.ZodNumber;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"animate">;
    id: z.ZodString;
    animation: z.ZodEnum<{
        "fade-in": "fade-in";
        "slide-in": "slide-in";
        pulse: "pulse";
        highlight: "highlight";
    }>;
    durationMs: z.ZodOptional<z.ZodNumber>;
    iterations: z.ZodOptional<z.ZodNumber>;
}, z.core.$strict>, z.ZodObject<{
    op: z.ZodLiteral<"focus">;
    id: z.ZodNullable<z.ZodString>;
}, z.core.$strict>], "op">>;
/** One rendered blackboard element after op folding. */
export interface BoardElementState {
    readonly id: string;
    readonly kind: BoardElementKind;
    readonly content: string;
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
    readonly style: BoardStyle;
    readonly focused: boolean;
    readonly animation?: {
        readonly name: 'fade-in' | 'slide-in' | 'pulse' | 'highlight';
        readonly durationMs: number;
        readonly iterations: number;
        readonly run: number;
    } | undefined;
}
/** Immutable blackboard state keyed by element id. */
export type BoardState = ReadonlyMap<string, BoardElementState>;
/** Empty immutable input for the first board commit. */
export declare const EMPTY_BOARD_STATE: BoardState;
/**
 * Apply one validated op batch atomically to the current board state.
 * @param state - current element map.
 * @param ops - validated, non-empty ops in application order.
 * @returns the new state and the number of applied ops.
 */
export declare function applyBoardOps(state: BoardState, ops: readonly BoardOp[]): {
    readonly state: BoardState;
    readonly revision: number;
};
/** Snapshot field containing only the final projected board state. */
export declare const boardSnapshotSchema: z.ZodObject<{
    version: z.ZodLiteral<4>;
    revision: z.ZodNumber;
    elements: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        kind: z.ZodEnum<{
            text: "text";
            markdown: "markdown";
            math: "math";
            svg: "svg";
            html: "html";
            image: "image";
            table: "table";
        }>;
        content: z.ZodString;
        x: z.ZodNumber;
        y: z.ZodNumber;
        w: z.ZodNumber;
        h: z.ZodNumber;
        style: z.ZodObject<{
            color: z.ZodOptional<z.ZodString>;
            fontSize: z.ZodOptional<z.ZodString>;
        }, z.core.$strict>;
        focused: z.ZodBoolean;
        animation: z.ZodOptional<z.ZodObject<{
            name: z.ZodEnum<{
                "fade-in": "fade-in";
                "slide-in": "slide-in";
                pulse: "pulse";
                highlight: "highlight";
            }>;
            durationMs: z.ZodNumber;
            iterations: z.ZodNumber;
            run: z.ZodNumber;
        }, z.core.$strict>>;
    }, z.core.$strict>>;
    invalid: z.ZodNumber;
}, z.core.$strict>;
export type BoardSnapshot = z.infer<typeof boardSnapshotSchema>;
/** Empty snapshot used before any board commit. */
export declare const EMPTY_BOARD_SNAPSHOT: BoardSnapshot;
/**
 * Read renderable elements from one final-state snapshot.
 * @param snapshot - projected final board state.
 * @returns ordered elements plus the committed revision.
 */
export declare function foldBoardSnapshot(snapshot: BoardSnapshot): {
    readonly elements: readonly BoardElementState[];
    readonly revision: number;
};
/**
 * Fold a raw op list from first-set order; used by protocol tests.
 * @param ops - one validated op batch.
 * @returns final elements in insertion order.
 */
export declare function foldBoardElements(ops: readonly BoardOp[]): readonly BoardElementState[];
