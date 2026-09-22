/**
 * Button classes for the service landings. They live here rather than in each
 * page so the hero and the closing band look the same on every service, while
 * the pages keep deciding where their buttons actually go.
 */

const BASE =
  "flex h-12 items-center justify-center gap-2 rounded-xl transition-300"

/** Hero, on the light ground. */
export const HERO_PRIMARY = `${BASE} w-full bg-sand-950 px-7 font-medium text-white hover:bg-sand-800 sm:w-auto`
export const HERO_SECONDARY = `${BASE} w-full border border-sand-200 bg-white px-6 font-medium text-sand-950 hover:bg-sand-100 sm:w-auto`

/** Closing band, on the dark surface. */
export const BAND_PRIMARY = `${BASE} bg-white px-7 font-semibold text-sand-950 hover:bg-sand-100`
export const BAND_SECONDARY = `${BASE} border border-white/30 px-7 font-semibold text-white hover:bg-white/10`
