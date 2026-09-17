import type { BadgeTone } from "@/shared/ui"
import type { ConversationStatus } from "./types"

export const CONVERSATION_STATUS: Record<
  ConversationStatus,
  { label: string; tone: BadgeTone }
> = {
  active: { label: "Active", tone: "accent" },
  resolved: { label: "Resolved", tone: "success" },
  escalated: { label: "Escalated", tone: "warning" },
}
