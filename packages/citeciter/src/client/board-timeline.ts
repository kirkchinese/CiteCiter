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

/** Whether timeline playback is permitted by both the board setting and system preference. */
export function timelineMotionAllowed(animations: boolean, reducedMotion: boolean): boolean {
  return animations && !reducedMotion
}

function motionPreference(): MediaQueryList | undefined {
  return typeof window === 'undefined' ? undefined : window.matchMedia?.('(prefers-reduced-motion: reduce)')
}

/** Playback state of one board timeline. */
export interface TimelinePlayer {
  readonly t: number
  readonly playing: boolean
  readonly canPlay: boolean
  readonly toggle: () => void
  readonly seek: (atMs: number) => void
}

/**
 * Drive a compiled timeline with requestAnimationFrame. A new timeline plays once when motion is
 * allowed; otherwise it rests on its final frame. A frozen time (frame capture) never plays.
 * @param timeline - compiled timeline, or null.
 * @param key - identity of the timeline; a new key restarts playback.
 * @param options - animation permission and an optional frozen capture time.
 */
export function useTimelinePlayer(timeline: CompiledTimeline | null, key: string | null, options: { readonly autoplay: boolean, readonly frozenAt?: number | undefined }): TimelinePlayer {
  const duration = timeline?.durationMs ?? 0
  const [t, setT] = useState(options.frozenAt ?? duration)
  const [playing, setPlaying] = useState(false)
  const [reduce, setReduce] = useState(() => motionPreference()?.matches === true)
  const canPlay = timelineMotionAllowed(options.autoplay, reduce) && options.frozenAt === undefined
  const time = useRef(t)
  time.current = t

  useEffect(() => {
    const media = motionPreference()
    if (media === undefined) return
    const onChange = () => setReduce(media.matches)
    media.addEventListener('change', onChange)
    onChange()
    return () => media.removeEventListener('change', onChange)
  }, [])

  useEffect(() => {
    if (options.frozenAt !== undefined) { setT(options.frozenAt); setPlaying(false); return }
    const play = canPlay && timeline !== null
    setT(play ? 0 : duration)
    setPlaying(play)
    // Restart for a different timeline or motion policy, not unrelated re-renders.
  }, [key, options.frozenAt, canPlay, duration])

  useEffect(() => {
    if (!playing || !canPlay || timeline === null) return
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
  }, [playing, canPlay, timeline, duration])

  const toggle = useCallback(() => {
    if (timeline === null || !canPlay) return
    setPlaying(current => {
      if (!current && time.current >= duration) setT(0)
      return !current
    })
  }, [timeline, duration, canPlay])
  const seek = useCallback((atMs: number) => { setPlaying(false); setT(Math.min(duration, Math.max(0, atMs))) }, [duration])
  return { t, playing, canPlay, toggle, seek }
}
