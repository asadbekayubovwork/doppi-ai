// Fixed anchor points (percent of the square diagram box); each chip is centred
// on its point. Listed clockwise from the top, which is also the order the
// chips enter in and the order the comet reaches them.
export const ORBIT_POSITIONS = [
  { top: 2, left: 50 },
  { top: 27, left: 93 },
  { top: 73, left: 93 },
  { top: 98, left: 50 },
  { top: 73, left: 7 },
  { top: 27, left: 7 },
]

export const orbitPositionAt = (i: number) =>
  ORBIT_POSITIONS[i % ORBIT_POSITIONS.length]

/** Where a chip sits round the hub, in degrees clockwise from 12 o'clock. */
export const orbitAngleAt = (i: number) => {
  const { top, left } = orbitPositionAt(i)
  const deg = (Math.atan2(left - 50, 50 - top) * 180) / Math.PI
  return (deg + 360) % 360
}

/** Orbit radius, in percent of the diagram box; the hub sits at its centre. */
export const ORBIT_RADIUS = 47

/** Length of the comet's tail: its head leads the arc's start by this much. */
export const COMET_SWEEP_DEG = 24

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * Where the orbit, run clockwise, first passes under the chip anchored at
 * `angle` — the point at which the comet reads as reaching it, since it slips
 * beneath the chip there. `chip` is relative to the hub, in the same unit as
 * `radius`. Falls back to `angle` when the chip is off the orbit.
 */
export const orbitEntryAngle = (angle: number, chip: Box, radius: number) => {
  for (let lead = 90; lead > 0; lead -= 0.5) {
    const rad = ((angle - lead) * Math.PI) / 180
    const x = radius * Math.sin(rad)
    const y = -radius * Math.cos(rad)
    if (x >= chip.left && x <= chip.right && y >= chip.top && y <= chip.bottom)
      return (angle - lead + 360) % 360
  }
  return angle
}

/** Travelling light running into the hub; `id` restarts it for each send. */
export interface OrbitFlow {
  index: number
  id: number
}
