import type { PlanStatus, PlanVideoState } from "@/entities/video"
import type { BadgeTone } from "@/shared/ui/types"

/** Header chip for a whole weekly plan. */
export const PLAN_STATUS_META: Record<
  PlanStatus,
  { label: string; tone: BadgeTone; dot: boolean }
> = {
  done: { label: "Done", tone: "success", dot: false },
  ongoing: { label: "Ongoing", tone: "accent", dot: true },
  upcoming: { label: "Upcoming", tone: "warning", dot: false },
}

/** Left-rail heading per plan status. */
export const PLAN_RAIL_TITLE: Record<PlanStatus, string> = {
  done: "Bajarilgan planlar",
  ongoing: "Faol plan",
  upcoming: "Tasdiqlash kutilmoqda",
}

/** Timeline node + card treatment per video state. */
export const VIDEO_STATE_META: Record<
  PlanVideoState,
  {
    /** Timeline node icon. */
    node: "check" | "loader" | "sparkles" | "pencil"
    nodeClass: string
    /** Optional status pill on the card. */
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
    pill: { label: "Process", tone: "warning", icon: "loader-circle" },
  },
  scheduled: {
    node: "sparkles",
    nodeClass: "bg-[#EFECFF] text-[#5B4BE8]",
    pill: { label: "Rejada", tone: "neutral", icon: "clock" },
  },
  draft: {
    node: "pencil",
    nodeClass: "border border-[#E7C79A] bg-[#FEF6E9] text-[#B45309]",
    pill: { label: "Draft", tone: "warning" },
  },
}
