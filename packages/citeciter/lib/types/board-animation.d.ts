/**
 * Board animation timelines: a declarative spec of verbs, keyframes, SVG paths and restricted
 * parametric expressions over existing board elements, plus a pure sampler shared by the Host
 * validator, the browser player and frame capture. Coordinates are canvas percentages.
 */
import { z } from 'zod';
export declare const ANIMATION_MAX_TRACKS = 40;
export declare const ANIMATION_MAX_BEATS = 20;
export declare const ANIMATION_MAX_FRAMES = 40;
export declare const ANIMATION_MAX_DURATION_MS = 30000;
declare const easingSchema: z.ZodEnum<{
    linear: "linear";
    "ease-in": "ease-in";
    "ease-out": "ease-out";
    "ease-in-out": "ease-in-out";
}>;
export type AnimationEasing = z.infer<typeof easingSchema>;
/** One verb applied to one board element. */
export declare const animationTrackSchema: z.ZodObject<{
    target: z.ZodString;
    verb: z.ZodEnum<{
        appear: "appear";
        disappear: "disappear";
        move: "move";
        scale: "scale";
        rotate: "rotate";
        highlight: "highlight";
        reveal: "reveal";
        follow: "follow";
        keyframes: "keyframes";
        parametric: "parametric";
    }>;
    startMs: z.ZodOptional<z.ZodNumber>;
    endMs: z.ZodOptional<z.ZodNumber>;
    easing: z.ZodOptional<z.ZodEnum<{
        linear: "linear";
        "ease-in": "ease-in";
        "ease-out": "ease-out";
        "ease-in-out": "ease-in-out";
    }>>;
    to: z.ZodOptional<z.ZodObject<{
        x: z.ZodNumber;
        y: z.ZodNumber;
    }, z.core.$strict>>;
    scale: z.ZodOptional<z.ZodNumber>;
    degrees: z.ZodOptional<z.ZodNumber>;
    direction: z.ZodOptional<z.ZodEnum<{
        left: "left";
        right: "right";
        up: "up";
        down: "down";
    }>>;
    path: z.ZodOptional<z.ZodString>;
    orient: z.ZodOptional<z.ZodBoolean>;
    frames: z.ZodOptional<z.ZodArray<z.ZodObject<{
        atMs: z.ZodNumber;
        x: z.ZodOptional<z.ZodNumber>;
        y: z.ZodOptional<z.ZodNumber>;
        opacity: z.ZodOptional<z.ZodNumber>;
        scale: z.ZodOptional<z.ZodNumber>;
        rotate: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strict>>>;
    x: z.ZodOptional<z.ZodString>;
    y: z.ZodOptional<z.ZodString>;
    t: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
}, z.core.$strict>;
export type AnimationTrack = z.infer<typeof animationTrackSchema>;
/** One complete timeline as written by the model. */
export declare const animationSpecSchema: z.ZodObject<{
    durationMs: z.ZodNumber;
    loop: z.ZodOptional<z.ZodBoolean>;
    beats: z.ZodOptional<z.ZodArray<z.ZodObject<{
        atMs: z.ZodNumber;
        caption: z.ZodString;
    }, z.core.$strict>>>;
    tracks: z.ZodArray<z.ZodObject<{
        target: z.ZodString;
        verb: z.ZodEnum<{
            appear: "appear";
            disappear: "disappear";
            move: "move";
            scale: "scale";
            rotate: "rotate";
            highlight: "highlight";
            reveal: "reveal";
            follow: "follow";
            keyframes: "keyframes";
            parametric: "parametric";
        }>;
        startMs: z.ZodOptional<z.ZodNumber>;
        endMs: z.ZodOptional<z.ZodNumber>;
        easing: z.ZodOptional<z.ZodEnum<{
            linear: "linear";
            "ease-in": "ease-in";
            "ease-out": "ease-out";
            "ease-in-out": "ease-in-out";
        }>>;
        to: z.ZodOptional<z.ZodObject<{
            x: z.ZodNumber;
            y: z.ZodNumber;
        }, z.core.$strict>>;
        scale: z.ZodOptional<z.ZodNumber>;
        degrees: z.ZodOptional<z.ZodNumber>;
        direction: z.ZodOptional<z.ZodEnum<{
            left: "left";
            right: "right";
            up: "up";
            down: "down";
        }>>;
        path: z.ZodOptional<z.ZodString>;
        orient: z.ZodOptional<z.ZodBoolean>;
        frames: z.ZodOptional<z.ZodArray<z.ZodObject<{
            atMs: z.ZodNumber;
            x: z.ZodOptional<z.ZodNumber>;
            y: z.ZodOptional<z.ZodNumber>;
            opacity: z.ZodOptional<z.ZodNumber>;
            scale: z.ZodOptional<z.ZodNumber>;
            rotate: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strict>>>;
        x: z.ZodOptional<z.ZodString>;
        y: z.ZodOptional<z.ZodString>;
        t: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
    }, z.core.$strict>>;
}, z.core.$strict>;
export type AnimationSpec = z.infer<typeof animationSpecSchema>;
/** The board's current timeline: the spec of the latest successful call, keyed by that call. */
export declare const boardTimelineSchema: z.ZodObject<{
    id: z.ZodString;
    spec: z.ZodObject<{
        durationMs: z.ZodNumber;
        loop: z.ZodOptional<z.ZodBoolean>;
        beats: z.ZodOptional<z.ZodArray<z.ZodObject<{
            atMs: z.ZodNumber;
            caption: z.ZodString;
        }, z.core.$strict>>>;
        tracks: z.ZodArray<z.ZodObject<{
            target: z.ZodString;
            verb: z.ZodEnum<{
                appear: "appear";
                disappear: "disappear";
                move: "move";
                scale: "scale";
                rotate: "rotate";
                highlight: "highlight";
                reveal: "reveal";
                follow: "follow";
                keyframes: "keyframes";
                parametric: "parametric";
            }>;
            startMs: z.ZodOptional<z.ZodNumber>;
            endMs: z.ZodOptional<z.ZodNumber>;
            easing: z.ZodOptional<z.ZodEnum<{
                linear: "linear";
                "ease-in": "ease-in";
                "ease-out": "ease-out";
                "ease-in-out": "ease-in-out";
            }>>;
            to: z.ZodOptional<z.ZodObject<{
                x: z.ZodNumber;
                y: z.ZodNumber;
            }, z.core.$strict>>;
            scale: z.ZodOptional<z.ZodNumber>;
            degrees: z.ZodOptional<z.ZodNumber>;
            direction: z.ZodOptional<z.ZodEnum<{
                left: "left";
                right: "right";
                up: "up";
                down: "down";
            }>>;
            path: z.ZodOptional<z.ZodString>;
            orient: z.ZodOptional<z.ZodBoolean>;
            frames: z.ZodOptional<z.ZodArray<z.ZodObject<{
                atMs: z.ZodNumber;
                x: z.ZodOptional<z.ZodNumber>;
                y: z.ZodOptional<z.ZodNumber>;
                opacity: z.ZodOptional<z.ZodNumber>;
                scale: z.ZodOptional<z.ZodNumber>;
                rotate: z.ZodOptional<z.ZodNumber>;
            }, z.core.$strict>>>;
            x: z.ZodOptional<z.ZodString>;
            y: z.ZodOptional<z.ZodString>;
            t: z.ZodOptional<z.ZodTuple<[z.ZodNumber, z.ZodNumber], null>>;
        }, z.core.$strict>>;
    }, z.core.$strict>;
}, z.core.$strict>;
export type BoardTimeline = z.infer<typeof boardTimelineSchema>;
type Expression = (t: number) => number;
/**
 * Compile a restricted arithmetic expression of `t`: numbers, `+ - * / ^`, parentheses,
 * the constants pi, e, tau and a fixed set of Math functions. Nothing else is accepted.
 * @throws an Error naming the first unexpected token.
 */
export declare function compileExpression(source: string): Expression;
interface Point {
    readonly x: number;
    readonly y: number;
}
/** A sampled path: points with cumulative arc length. */
export interface SampledPath {
    readonly points: readonly Point[];
    readonly lengths: readonly number[];
    readonly total: number;
}
/**
 * Sample an SVG path (M L H V C S Q T A Z, absolute and relative) into a polyline.
 * @throws an Error for unsupported commands or malformed numbers.
 */
export declare function samplePath(d: string): SampledPath;
/** Position and tangent angle (degrees) at a fraction of a sampled path's length. */
export declare function pointAlong(path: SampledPath, fraction: number): {
    readonly x: number;
    readonly y: number;
    readonly angle: number;
};
/** Render-ready transform of one element at one time. */
export interface ElementFrame {
    /** Translation in canvas percent. */
    readonly dx: number;
    readonly dy: number;
    readonly scale: number;
    readonly rotate: number;
    readonly opacity: number;
    /** Hidden fraction (0-100) clipped from `clipSide`. */
    readonly clip: number;
    readonly clipSide: 'left' | 'right' | 'top' | 'bottom';
    /** Highlight glow strength, 0-1. */
    readonly glow: number;
}
type Prop = 'dx' | 'dy' | 'scale' | 'rotate' | 'opacity' | 'clip' | 'glow' | 'slideX' | 'slideY';
interface Segment {
    readonly start: number;
    readonly end: number;
    /** Value shown before the segment starts when it is the first for its property. */
    readonly before?: number;
    readonly at: (t: number, from: number) => number;
}
interface CompiledElement {
    readonly segments: ReadonlyMap<Prop, readonly Segment[]>;
    /** Value of each segment's property at its start, from the segments before it. */
    readonly from: ReadonlyMap<Segment, number>;
    readonly clipSide: ElementFrame['clipSide'];
}
/** A timeline compiled against the board element envelopes it animates. */
export interface CompiledTimeline {
    readonly durationMs: number;
    readonly loop: boolean;
    readonly beats: readonly {
        readonly atMs: number;
        readonly caption: string;
    }[];
    readonly elements: ReadonlyMap<string, CompiledElement>;
}
/** Envelope fields a timeline needs from each target. */
export interface AnimationTargetEnvelope {
    readonly id: string;
    readonly x: number;
    readonly y: number;
    readonly w: number;
    readonly h: number;
}
/**
 * Validate and compile a timeline against the current board.
 * @param spec - parsed timeline spec.
 * @param targets - current board element envelopes.
 * @returns the compiled timeline.
 * @throws an Error describing the first invalid track.
 */
export declare function compileTimeline(spec: AnimationSpec, targets: readonly AnimationTargetEnvelope[]): CompiledTimeline;
/**
 * Sample every animated element at one time.
 * @param timeline - compiled timeline.
 * @param atMs - time within the timeline; clamped to its duration.
 * @returns frames keyed by element id; elements without tracks are absent.
 */
export declare function sampleTimeline(timeline: CompiledTimeline, atMs: number): Map<string, ElementFrame>;
/** Caption of the latest beat at or before a time, or null. */
export declare function beatAt(timeline: CompiledTimeline, atMs: number): string | null;
export {};
