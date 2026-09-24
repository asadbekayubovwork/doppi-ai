import type { AgentStats } from "@/entities/rag-agent"
import { formatCount, formatPercent } from "@/shared/lib"

export interface AgentMetric {
  /** Names the metric; its label is `dashboard.rag.metrics.<key>`. */
  key: string
  value: string
  /** Formatted change against the previous period; `null` when flat. */
  change: string | null
  /** Whether the change is good news — a falling response time is. */
  improved: boolean
}

const metric = (
  key: string,
  value: string,
  change: number,
  formatChange: (change: number) => string,
  higherIsBetter: boolean
): AgentMetric => ({
  key,
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
      "conversations",
      formatCount(stats.conversations),
      stats.conversationsChange,
      percentChange,
      true
    ),
    metric(
      "messages30d",
      formatCount(stats.messages30d),
      stats.messagesChange,
      percentChange,
      true
    ),
    metric(
      "avgResponse",
      orNoData(`${(stats.avgResponseMs / 1000).toFixed(1)}s`),
      stats.avgResponseChangeMs,
      millisecondChange,
      false
    ),
    metric(
      "accuracy",
      orNoData(formatPercent(stats.answerAccuracy)),
      stats.answerAccuracyChange,
      percentChange,
      true
    ),
    metric(
      "escalation",
      orNoData(formatPercent(stats.escalationRate)),
      stats.escalationRateChange,
      percentChange,
      false
    ),
  ]
}
