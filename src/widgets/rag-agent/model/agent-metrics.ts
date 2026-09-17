import type { AgentStats } from "@/entities/rag-agent"
import { formatCount, formatPercent } from "@/shared/lib"

export interface AgentMetric {
  label: string
  value: string
  /** Formatted change against the previous period; `null` when flat. */
  change: string | null
  /** Whether the change is good news — a falling response time is. */
  improved: boolean
}

const metric = (
  label: string,
  value: string,
  change: number,
  formatChange: (change: number) => string,
  higherIsBetter: boolean
): AgentMetric => ({
  label,
  value,
  change: change === 0 ? null : formatChange(change),
  improved: higherIsBetter ? change > 0 : change < 0,
})

const percentChange = (change: number) => formatPercent(change, true)
const millisecondChange = (change: number) =>
  `${change > 0 ? "+" : ""}${formatCount(change)} ms`

/** Shown for averages and rates that have no conversations to average over. */
const NO_DATA = "—"

export function buildAgentMetrics(stats: AgentStats): AgentMetric[] {
  const hasConversations = stats.conversations > 0
  const orNoData = (value: string) => (hasConversations ? value : NO_DATA)

  return [
    metric(
      "Conversations",
      formatCount(stats.conversations),
      stats.conversationsChange,
      percentChange,
      true
    ),
    metric(
      "Messages · 30 days",
      formatCount(stats.messages30d),
      stats.messagesChange,
      percentChange,
      true
    ),
    metric(
      "Avg. response time",
      orNoData(`${(stats.avgResponseMs / 1000).toFixed(1)}s`),
      stats.avgResponseChangeMs,
      millisecondChange,
      false
    ),
    metric(
      "Answer accuracy",
      orNoData(formatPercent(stats.answerAccuracy)),
      stats.answerAccuracyChange,
      percentChange,
      true
    ),
    metric(
      "Escalated to human",
      orNoData(formatPercent(stats.escalationRate)),
      stats.escalationRateChange,
      percentChange,
      false
    ),
  ]
}
