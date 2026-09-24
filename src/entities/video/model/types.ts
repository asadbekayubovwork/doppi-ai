// Domain types for the Video Generator surfaces (dashboard, plans, studio).
// These describe the shapes the UI renders; the numbers themselves live in
// `api/fixtures.ts` until the control plane exposes the endpoints. Dates are
// ISO strings the UI formats per language; fields documented as i18n keys
// hold interface copy, the rest is content shown as written.

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
  /** i18n key. */
  label: string
  /** Rendered as-is ("186", "2.4M", "6.8%"). */
  value: string
  icon: string
  /** Change chip figure, e.g. "+24", "+18%". */
  change?: string
  /** i18n key of the words after (or instead of) the figure: "this month". */
  changeLabel?: string
  changeTone?: "success" | "danger" | "neutral"
  /** Sparkle/bars visual: normalized 0..1 heights. */
  spark?: number[]
  /** i18n key of an optional secondary line under the value. */
  hint?: string
  /** Engagement-style progress bar (0..1) instead of a sparkline. */
  progress?: number
}

/** A row in the "Top performing videos" table. */
export interface TopVideo {
  id: string
  rank: number
  title: string
  /** Week of the month the video ran in; shown as "September · week 2". */
  week: number
  platform: PlatformKind
  /** ISO date. */
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
  /** Creator handle; trend ideas have none and show `trendPosts` instead. */
  author?: string
  /** Post count behind a trend, e.g. "42K". */
  trendPosts?: string
  tag: "franchise" | "trend"
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
  /** ISO date. */
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
  /** First and last day, ISO; the title reads "September · week 3". */
  start: string
  end: string
  week: number
  /** i18n key of the one-line summary under the title. */
  range: string
  status: PlanStatus
  /** e.g. "6/6", "3/7". */
  progress: string
  /** Completed count for the ratio bar. */
  produced: number
  total: number
  views?: string
  videos: PlanVideo[]
  /** i18n key of the contextual note shown under the plan. */
  note?: string
}

/** A past week in the plans rail. */
export interface PlanHistoryEntry {
  id: string
  start: string
  end: string
  week: number
  status: PlanStatus
  progress: string
  views?: string
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
