// Domain types for the Video Generator surfaces (dashboard, plans, studio).
// These describe the shapes the UI renders; the numbers themselves live in
// `api/fixtures.ts` until the control plane exposes the endpoints.

/** Social platforms a generated video can be published to. */
export type PlatformKind = "instagram" | "tiktok" | "youtube"

/** Lifecycle of a weekly content plan produced by the agent system. */
export type PlanStatus = "done" | "ongoing" | "upcoming"

/** State of a single video inside a weekly plan. */
export type PlanVideoState =
  | "published" // released, has views
  | "processing" // being generated
  | "draft" // scripted, waiting for approval / schedule
  | "scheduled" // approved, date not reached yet

/** A headline KPI card at the top of the dashboard. */
export interface VideoMetric {
  id: string
  label: string
  /** Rendered as-is ("186", "2.4M", "6.8%"). */
  value: string
  icon: string
  /** Change chip, e.g. "+24 bu oy", "+18%". */
  change?: string
  changeTone?: "success" | "danger" | "neutral"
  /** Sparkle/bars visual: normalized 0..1 heights. */
  spark?: number[]
  /** Optional secondary line under the value. */
  hint?: string
  /** Engagement-style progress bar (0..1) instead of a sparkline. */
  progress?: number
}

/** A row in the "Top performing videos" table. */
export interface TopVideo {
  id: string
  rank: number
  title: string
  period: string
  platform: PlatformKind
  date: string
  views: string
  engagement: string
  growth: string
  thumbnail: string
}

/** A channel's share of total views. */
export interface ChannelShare {
  platform: PlatformKind
  views: string
  /** Percentage of total, 0..100. */
  percent: number
}

/** A recommended content idea from the research agent. */
export interface Recommendation {
  id: string
  title: string
  author: string
  tag: string
  views: string
  engagement: string
  thumbnail: string
  trending?: boolean
}

/** A single video item inside a weekly plan. */
export interface PlanVideo {
  id: string
  order: number
  title: string
  brief: string
  platform: PlatformKind
  date: string
  time: string
  state: PlanVideoState
  views?: string
  /** True when the script is locked (past weeks). */
  locked?: boolean
  thumbnail?: string
}

/** A weekly content plan. */
export interface WeekPlan {
  id: string
  title: string
  range: string
  status: PlanStatus
  /** e.g. "6/6", "3/7". */
  progress: string
  /** Completed count for the ratio bar. */
  produced: number
  total: number
  views?: string
  videos: PlanVideo[]
  /** Contextual note shown under the plan header. */
  note?: string
}

/** One day cell in the month calendar. */
export interface CalendarDay {
  day: number
  /** Marker dot under the number. */
  marker?: "published" | "plan" | "scheduled" | "other"
  /** Highlighted range (current plan week). */
  inRange?: boolean
  today?: boolean
  muted?: boolean
}

/** A message in the AI script-editing conversation. */
export interface ScriptMessage {
  id: string
  role: "assistant" | "user"
  text: string
  chips?: string[]
}

/** A video the user has generated (studio "Mening videolarim" list). */
export type StudioVideoStatus =
  | "ready"
  | "processing"
  | "failed"
  | "review"
  | "published"
  | "draft"

export interface StudioVideo {
  id: string
  title: string
  meta: string
  status: StudioVideoStatus
  thumbnail: string
  previewUrl?: string
  downloadUrl?: string
  /** @deprecated Only retained for the unused legacy fixture shape. */
  hasLink?: boolean
}

/** A publish target toggle in the studio publish modal. */
export interface PublishTarget {
  platform: PlatformKind
  handle: string
  enabled: boolean
}
