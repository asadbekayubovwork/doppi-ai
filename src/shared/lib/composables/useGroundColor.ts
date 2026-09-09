import { ref, readonly } from "vue"

/* ---------------------------------------------------------------------------
   Live page-ground colour.

   A preview tool: it drives `--bg-ground` / `--bg-raised` (see
   `app/styles/base.css`) so the whole landing can be re-tinted from the header
   without a rebuild. The chosen value is kept in localStorage, so a reload — or
   a walk through the other pages — keeps showing it.

   Nothing here runs until someone picks a colour; the untouched site renders
   exactly the palette defined in CSS.
--------------------------------------------------------------------------- */

/** The shipped ground colour — what "Reset" goes back to. */
export const DEFAULT_GROUND = "#0E041F"

/** How much lighter `.section-raised` sits above the ground, in HSL lightness points. */
const RAISED_LIFT = 2.6

const STORAGE_KEY = "doppi:ground"

/** Ready-made steps from the shipped colour up to a noticeably lighter violet. */
export const GROUND_PRESETS = [0, 2, 4, 6, 9, 12] as const

interface Rgb {
  r: number
  g: number
  b: number
}

/** Accepts `#abc`, `abc`, `#AABBCC`; returns `#RRGGBB` or null. */
export const normalizeHex = (value: string): string | null => {
  const hex = value.trim().replace(/^#/, "")
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    const [r, g, b] = hex.split("")
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase()
  }
  if (/^[0-9a-f]{6}$/i.test(hex)) return `#${hex}`.toUpperCase()
  return null
}

const hexToRgb = (hex: string): Rgb => ({
  r: parseInt(hex.slice(1, 3), 16),
  g: parseInt(hex.slice(3, 5), 16),
  b: parseInt(hex.slice(5, 7), 16),
})

const rgbToHex = ({ r, g, b }: Rgb) =>
  `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`.toUpperCase()

/**
 * Lifts a colour by `points` of HSL lightness, keeping hue and saturation. Used
 * for the raised band so it stays a sibling of whatever ground is picked
 * instead of a fixed violet that would clash with a lighter base.
 */
const lighten = (hex: string, points: number): string => {
  const { r, g, b } = hexToRgb(hex)
  const [rf, gf, bf] = [r / 255, g / 255, b / 255]
  const max = Math.max(rf, gf, bf)
  const min = Math.min(rf, gf, bf)
  const l = (max + min) / 2
  const d = max - min

  let h = 0
  let s = 0
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    if (max === rf) h = (gf - bf) / d + (gf < bf ? 6 : 0)
    else if (max === gf) h = (bf - rf) / d + 2
    else h = (rf - gf) / d + 4
    h /= 6
  }

  const nextL = Math.min(1, Math.max(0, l + points / 100))
  if (s === 0) {
    const channel = Math.round(nextL * 255)
    return rgbToHex({ r: channel, g: channel, b: channel })
  }

  const q = nextL < 0.5 ? nextL * (1 + s) : nextL + s - nextL * s
  const p = 2 * nextL - q
  const toChannel = (t: number) => {
    let shifted = t
    if (shifted < 0) shifted += 1
    if (shifted > 1) shifted -= 1
    if (shifted < 1 / 6) return p + (q - p) * 6 * shifted
    if (shifted < 1 / 2) return q
    if (shifted < 2 / 3) return p + (q - p) * (2 / 3 - shifted) * 6
    return p
  }

  return rgbToHex({
    r: Math.round(toChannel(h + 1 / 3) * 255),
    g: Math.round(toChannel(h) * 255),
    b: Math.round(toChannel(h - 1 / 3) * 255),
  })
}

/** The preset swatches, derived from the shipped colour. */
export const groundPresets = GROUND_PRESETS.map((points) => ({
  points,
  hex: points === 0 ? DEFAULT_GROUND : lighten(DEFAULT_GROUND, points),
}))

const channels = (hex: string) => {
  const { r, g, b } = hexToRgb(hex)
  return `${r} ${g} ${b}`
}

const VARIABLES = [
  "--bg-ground",
  "--bg-ground-rgb",
  "--bg-raised",
  "--bg-raised-rgb",
]

const paint = (hex: string) => {
  const root = document.documentElement.style
  // Back to the shipped palette: drop the override rather than re-deriving it,
  // so the raised band lands on the exact designed value and not a rounded
  // reconstruction of it.
  if (hex === DEFAULT_GROUND) {
    VARIABLES.forEach((name) => root.removeProperty(name))
  } else {
    const raised = lighten(hex, RAISED_LIFT)
    root.setProperty("--bg-ground", hex)
    root.setProperty("--bg-ground-rgb", channels(hex))
    root.setProperty("--bg-raised", raised)
    root.setProperty("--bg-raised-rgb", channels(raised))
  }
  // Keeps the mobile browser chrome in step with the page.
  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", hex)
}

// Module-level so every call site shares one value.
const ground = ref(DEFAULT_GROUND)
let restored = false

/**
 * The picker is a preview aid, not a product feature: it shows up in `pnpm dev`
 * and, on a deployed build, only when the URL carries `?bg` — so a real visitor
 * never sees it.
 */
export const isGroundPickerEnabled = (): boolean =>
  import.meta.env.DEV || new URLSearchParams(window.location.search).has("bg")

export const useGroundColor = () => {
  if (!restored) {
    restored = true
    // A `?bg=1a0b33` in the URL wins over the stored value — handy for sharing
    // an exact shade with someone else.
    const fromUrl = new URLSearchParams(window.location.search).get("bg")
    const stored =
      normalizeHex(fromUrl ?? "") ??
      normalizeHex(localStorage.getItem(STORAGE_KEY) ?? "")
    if (stored && stored !== DEFAULT_GROUND) {
      ground.value = stored
      paint(stored)
    }
  }

  const setGround = (value: string) => {
    const hex = normalizeHex(value)
    if (!hex || hex === ground.value) return
    ground.value = hex
    paint(hex)
    localStorage.setItem(STORAGE_KEY, hex)
  }

  const resetGround = () => {
    ground.value = DEFAULT_GROUND
    paint(DEFAULT_GROUND)
    localStorage.removeItem(STORAGE_KEY)
  }

  return {
    ground: readonly(ground),
    setGround,
    resetGround,
    presets: groundPresets,
    defaultGround: DEFAULT_GROUND,
  }
}
