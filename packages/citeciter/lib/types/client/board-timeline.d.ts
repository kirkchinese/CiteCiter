import { type CSSProperties } from 'react';
import type { CompiledTimeline, ElementFrame } from '../board-animation.ts';
/**
 * Inline style for one sampled element frame. Translation is converted from canvas percent
 * to the element's own percent, so no layout measurement is needed.
 * @param frame - sampled frame.
 * @param size - the element envelope's width and height in canvas percent.
 */
export declare function frameStyle(frame: ElementFrame, size: {
    readonly w: number;
    readonly h: number;
}): CSSProperties;
/** Whether timeline playback is permitted by both the board setting and system preference. */
export declare function timelineMotionAllowed(animations: boolean, reducedMotion: boolean): boolean;
/** Playback state of one board timeline. */
export interface TimelinePlayer {
    readonly t: number;
    readonly playing: boolean;
    readonly canPlay: boolean;
    readonly toggle: () => void;
    readonly seek: (atMs: number) => void;
}
/**
 * Drive a compiled timeline with requestAnimationFrame. A new timeline plays once when motion is
 * allowed; otherwise it rests on its final frame. A frozen time (frame capture) never plays.
 * @param timeline - compiled timeline, or null.
 * @param key - identity of the timeline; a new key restarts playback.
 * @param options - animation permission and an optional frozen capture time.
 */
export declare function useTimelinePlayer(timeline: CompiledTimeline | null, key: string | null, options: {
    readonly autoplay: boolean;
    readonly frozenAt?: number | undefined;
}): TimelinePlayer;
