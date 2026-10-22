import { useCallback, useEffect, useRef, useState, type CSSProperties } from 'react'
import type { CompiledTimeline, ElementFrame } from '../board-animation.ts'

/**
 * Inline style for one sampled element frame. Translation is converted from canvas percent
 * to the element's own percent, so no layout measurement is needed.
 * @param frame - sampled frame.
 * @param size - the element envelope's width and height in canvas percent.
 */
export function frameStyle(frame: ElementFrame, size: { readonly w: number, readonly h: number }): CSSProperties {
  const clip = frame.clip <= 0 ? undefined
    : frame.clipSide === 'right' ? `inset(0 ${frame.clip}% 0 0)`
      : frame.clipSide === 'left' ? `inset(0 0 0 ${frame.clip}%)`
        : frame.clipSide === 'top' ? `inset(${frame.clip}% 0 0 0)` : `inset(0 0 ${frame.clip}% 0)`
  return {
    transform: `translate(${(frame.dx / size.w) * 100}%, ${(frame.dy / size.h) * 100}%) rotate(${frame.rotate}deg) scale(${frame.scale})`,
    opacity: frame.opacity,
    ...(clip === undefined ? {} : { clipPath: clip }),
    ...(frame.glow <= 0 ? {} : { filter: `drop-shadow(0 0 ${(10 * frame.glow).toFixed(2)}px rgb(255 224 130 / ${(0.95 * frame.glow).toFixed(2)}))` }),
  }
}

function reducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches === true
}

/** Playback state of one board timeline. */
export interface TimelinePlayer {
  readonly t: number
  readonly playing: boolean
  readonly toggle: () => void
  readonly seek: (atMs: number) => void
}

/**
 * Drive a compiled timeline with requestAnimationFrame. A new timeline plays once when motion is
 * allowed; otherwise it rests on its final frame. A frozen time (frame capture) never plays.
 * @param timeline - compiled timeline, or null.
 * @param key - identity of the timeline; a new key restarts playback.
 * @param options - whether to autoplay and an optional frozen time.
 */
export function useTimelinePlayer(timeline: CompiledTimeline | null, key: string | null, options: { readonly autoplay: boolean, readonly frozenAt?: number | undefined }): TimelinePlayer {
  const duration = timeline?.durationMs ?? 0
  const [t, setT] = useState(options.frozenAt ?? duration)
  const [playing, setPlaying] = useState(false)
  const time = useRef(t)
  time.current = t

  useEffect(() => {
    if (options.frozenAt !== undefined) { setT(options.frozenAt); setPlaying(false); return }
    const play = options.autoplay && timeline !== null && !reducedMotion()
    setT(play ? 0 : duration)
    setPlaying(play)
    // Restart only for a different timeline, not for unrelated re-renders.
  }, [key, options.frozenAt])

  useEffect(() => {
    if (!playing || timeline === null) return
    let frame = 0
    let last = performance.now()
    const step = (now: number) => {
      let next = time.current + (now - last)
      last = now
      if (next >= duration) {
        if (timeline.loop) next %= duration
        else { setT(duration); setPlaying(false); return }
      }
      setT(next)
      frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [playing, timeline, duration])

  const toggle = useCallback(() => {
    if (timeline === null) return
    setPlaying(current => {
      if (!current && time.current >= duration) setT(0)
      return !current
    })
  }, [timeline, duration])
  const seek = useCallback((atMs: number) => { setPlaying(false); setT(Math.min(duration, Math.max(0, atMs))) }, [duration])
  return { t, playing, toggle, seek }
}
