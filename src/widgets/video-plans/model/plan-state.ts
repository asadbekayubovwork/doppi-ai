import type { PlanStatus, PlanVideoState } from "@/entities/video"
import type { BadgeTone } from "@/shared/ui/types"

/** Header chip for a whole weekly plan; `label` is an i18n key. */
export const PLAN_STATUS_META: Record<
  PlanStatus,
  { label: string; tone: BadgeTone; dot: boolean }
> = {
  done: { label: "dashboard.video.planStatus.done", tone: "success", dot: false },
  ongoing: { label: "dashboard.video.planStatus.ongoing", tone: "accent", dot: true },
  upcoming: {
    label: "dashboard.video.planStatus.upcoming",
    tone: "warning",
    dot: false,
  },
}

/** i18n key of the left-rail heading per plan status. */
export const PLAN_RAIL_TITLE: Record<PlanStatus, string> = {
  done: "dashboard.video.railTitle.done",
  ongoing: "dashboard.video.railTitle.ongoing",
  upcoming: "dashboard.video.railTitle.upcoming",
}

/** Timeline node + card treatment per video state. */
export const VIDEO_STATE_META: Record<
  PlanVideoState,
  {
    /** Timeline node icon. */
    node: "check" | "loader" | "sparkles" | "pencil"
    nodeClass: string
    /** Optional status pill on the card; `label` is an i18n key. */
    pill?: { label: string; tone: BadgeTone; icon?: string }
  }
> = {
  published: {
    node: "check",
    nodeClass: "bg-[#177A46] text-white",
  },
  processing: {
    node: "loader",
    nodeClass: "bg-[#EFECFF] text-[#5B4BE8]",
    pill: {
      label: "dashboard.video.videoState.processing",
      tone: "warning",
      icon: "loader-circle",
    },
  },
  scheduled: {
    node: "sparkles",
    nodeClass: "bg-[#EFECFF] text-[#5B4BE8]",
    pill: {
      label: "dashboard.video.videoState.scheduled",
      tone: "neutral",
      icon: "clock",
    },
  },
  draft: {
    node: "pencil",
    nodeClass: "border border-[#E7C79A] bg-[#FEF6E9] text-[#B45309]",
    pill: { label: "dashboard.video.videoState.draft", tone: "warning" },
  },
}
