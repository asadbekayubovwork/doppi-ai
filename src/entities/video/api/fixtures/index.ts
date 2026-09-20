// Stand-in data for the Video Generator screens until the control plane exposes
// the analytics, plans and studio endpoints. Split by surface so each file stays
// small; a later API swap only touches this folder.
export {
  CHANNEL_SHARES,
  RECOMMENDATIONS,
  TOP_VIDEOS,
  VIDEO_METRICS,
} from "./dashboard"
export {
  CALENDAR_DAYS,
  CALENDAR_WEEKDAYS,
  PLAN_HISTORY,
  SCRIPT_CONVERSATION,
  SCRIPT_CURRENT,
  SCRIPT_PROPOSED,
  WEEK_PLANS,
} from "./plans"
export {
  PUBLISH_TARGETS,
  STUDIO_CAPTION,
  STUDIO_HASHTAGS,
  STUDIO_VIDEOS,
} from "./studio"
