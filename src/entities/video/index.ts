export {
  PLATFORMS,
  PLATFORM_CHANNELS,
  type PlatformMeta,
} from "./model/platforms"
export { default as CPlatformPill } from "./ui/CPlatformPill.vue"
export { default as CVideoThumb } from "./ui/CVideoThumb.vue"
export { default as CVideoFrameThumb } from "./ui/CVideoFrameThumb.vue"
export { default as CVideoPlayer } from "./ui/CVideoPlayer.vue"
export { useVideoLabels } from "./model/labels"
export type {
  CalendarDay,
  ChannelShare,
  PlanHistoryEntry,
  PlanStatus,
  PlanVideo,
  PlanVideoState,
  PlatformKind,
  PublishTarget,
  Recommendation,
  ScriptMessage,
  StudioVideo,
  StudioVideoStatus,
  TopVideo,
  VideoMetric,
  WeekPlan,
} from "./model/types"
export {
  CALENDAR_DAYS,
  CHANNEL_SHARES,
  PLAN_HISTORY,
  PUBLISH_TARGETS,
  RECOMMENDATIONS,
  SCRIPT_CONVERSATION,
  SCRIPT_CURRENT,
  SCRIPT_PROPOSED,
  STUDIO_CAPTION,
  STUDIO_HASHTAGS,
  STUDIO_VIDEOS,
  TOP_VIDEOS,
  VIDEO_METRICS,
  WEEK_PLANS,
} from "./api/fixtures"
