import type { BadgeTone } from "@/shared/ui"
import type { ConversationStatus } from "./types"

/** `label` is an i18n key. */
export const CONVERSATION_STATUS: Record<
  ConversationStatus,
  { label: string; tone: BadgeTone }
> = {
  active: { label: "dashboard.rag.conversationStatus.active", tone: "accent" },
  resolved: {
    label: "dashboard.rag.conversationStatus.resolved",
    tone: "success",
  },
  escalated: {
    label: "dashboard.rag.conversationStatus.escalated",
    tone: "warning",
  },
}
