import {
  onMounted,
  onUnmounted,
  ref,
  watch,
  computed,
  type Ref,
  type ComputedRef,
} from "vue"

/** True when the visitor asked the OS to reduce animation. */
export function usePrefersReducedMotion(): Ref<boolean> {
  const reduced = ref(false)
  let mql: MediaQueryList | null = null
  const onChange = (e: MediaQueryListEvent) => (reduced.value = e.matches)

  onMounted(() => {
    // jsdom and other non-browser hosts have no matchMedia; assume motion is
    // fine there rather than throwing on mount.
    if (typeof window.matchMedia !== "function") return
    mql = window.matchMedia("(prefers-reduced-motion: reduce)")
    reduced.value = mql.matches
    mql.addEventListener("change", onChange)
  })
  onUnmounted(() => mql?.removeEventListener("change", onChange))

  return reduced
}

/**
 * Tracks whether an element is in the viewport. `once: false` keeps reporting,
 * so looping demos can pause while off-screen instead of burning timers.
 */
export function useInView(
  target: Ref<HTMLElement | null>,
  { threshold = 0.35, once = false }: { threshold?: number; once?: boolean } = {}
): Ref<boolean> {
  const inView = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!target.value) return
    // No observer (jsdom, very old browsers) → treat the element as visible so
    // count-ups and typewriters settle on their final content instead of never
    // starting.
    if (typeof IntersectionObserver === "undefined") {
      inView.value = true
      return
    }
    observer = new IntersectionObserver(
      ([entry]) => {
        inView.value = entry.isIntersecting
        if (entry.isIntersecting && once) observer?.disconnect()
      },
      { threshold }
    )
    observer.observe(target.value)
  })
  onUnmounted(() => observer?.disconnect())

  return inView
}

export interface ParsedStat {
  animatable: boolean
  prefix: string
  target: number
  decimals: number
  suffix: string
}

/**
 * Splits a stat string into an animatable spec. Only a clean
 * `[prefix][number][suffix]` counts up — ranges and composites stay static.
 *
 *   "70%"  → counts to 70%      "24/7"   → static (digit in the suffix)
 *   "$19"  → counts to $19      "2–5×"   → static (suffix opens with a dash)
 *   "2025" → counts to 2025     "Maxsus" → static (no leading number)
 */
export function parseStat(raw: string): ParsedStat {
  const fallback: ParsedStat = {
    animatable: false,
    prefix: "",
    target: 0,
    decimals: 0,
    suffix: raw,
  }

  const match = raw.match(/^(\D*?)(\d+(?:\.\d+)?)(.*)$/)
  if (!match) return fallback

  const [, prefix, numStr, suffix] = match
  if (/\d/.test(suffix)) return fallback
  if (/[–—\-/:]/.test(prefix)) return fallback
  if (/^[–—\-/:]/.test(suffix)) return fallback

  return {
    animatable: true,
    prefix,
    target: parseFloat(numStr),
    decimals: numStr.includes(".") ? numStr.split(".")[1].length : 0,
    suffix,
  }
}

const easeOutExpo = (t: number) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t))

/** Counts the leading number of `value` up once `active` flips true. */
export function useCountUp(
  value: Ref<string> | ComputedRef<string>,
  active: Ref<boolean>,
  duration = 1400
): ComputedRef<string> {
  const reduced = usePrefersReducedMotion()
  const spec = computed(() => parseStat(value.value))
  const display = ref(value.value)
  let frame = 0

  const stop = () => {
    if (frame) cancelAnimationFrame(frame)
    frame = 0
  }

  const run = () => {
    stop()
    if (!active.value || reduced.value || !spec.value.animatable) {
      display.value = value.value
      return
    }
    const { prefix, target, decimals, suffix } = spec.value
    const start = performance.now()
    const step = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      const current = target * easeOutExpo(progress)
      const shown = decimals
        ? current.toFixed(decimals)
        : Math.round(current).toString()
      display.value = `${prefix}${shown}${suffix}`
      if (progress < 1) frame = requestAnimationFrame(step)
      else display.value = value.value
    }
    display.value = `${prefix}${(0).toFixed(decimals)}${suffix}`
    frame = requestAnimationFrame(step)
  }

  watch([active, value, reduced], run, { immediate: true })
  onUnmounted(stop)

  return computed(() => display.value)
}

/**
 * Types `text` out character by character while `active`, optionally looping.
 * Reduced motion (or inactive) renders the full string immediately.
 */
export function useTypewriter(
  text: Ref<string> | ComputedRef<string>,
  {
    active,
    speed = 32,
    startDelay = 200,
    loop = false,
    holdMs = 2400,
  }: {
    active: Ref<boolean>
    speed?: number
    startDelay?: number
    loop?: boolean
    holdMs?: number
  }
): { typed: Ref<string>; done: Ref<boolean> } {
  const reduced = usePrefersReducedMotion()
  const typed = ref(text.value)
  const done = ref(true)
  let timers: number[] = []

  const clearAll = () => {
    timers.forEach((id) => window.clearTimeout(id))
    timers = []
  }

  const start = () => {
    clearAll()
    if (!active.value || reduced.value) {
      typed.value = text.value
      done.value = true
      return
    }

    const full = text.value
    let i = 0

    const tick = () => {
      i += 1
      typed.value = full.slice(0, i)
      if (i >= full.length) {
        done.value = true
        if (loop) timers.push(window.setTimeout(cycle, holdMs))
        return
      }
      timers.push(window.setTimeout(tick, speed))
    }

    const cycle = () => {
      i = 0
      typed.value = ""
      done.value = false
      timers.push(window.setTimeout(tick, speed))
    }

    typed.value = ""
    done.value = false
    timers.push(window.setTimeout(cycle, startDelay))
  }

  watch([active, text, reduced], start, { immediate: true })
  onUnmounted(clearAll)

  return { typed, done }
}

/** A live "MM:SS" call clock that ticks while `active`. */
export function useCallTimer(active: Ref<boolean>): ComputedRef<string> {
  const reduced = usePrefersReducedMotion()
  const seconds = ref(0)
  let interval = 0

  const stop = () => {
    if (interval) window.clearInterval(interval)
    interval = 0
  }

  watch(
    [active, reduced],
    () => {
      stop()
      if (!active.value || reduced.value) return
      seconds.value = 0
      interval = window.setInterval(() => (seconds.value += 1), 1000)
    },
    { immediate: true }
  )
  onUnmounted(stop)

  return computed(() => {
    if (reduced.value) return "00:24"
    const m = Math.floor(seconds.value / 60)
    const s = seconds.value % 60
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
  })
}
