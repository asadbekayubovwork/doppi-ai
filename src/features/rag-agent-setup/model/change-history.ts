export interface ChangeHistoryEntry {
  key: string
  icon: string
  /** `warning` marks the unsaved draft, `accent` this session's actions. */
  tone: "warning" | "accent" | "neutral"
  title: string
  detail?: string
  /** Already formatted: "now", "4 min ago". */
  time: string
}
