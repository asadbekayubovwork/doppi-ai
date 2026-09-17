import type { AgentStats } from "@/entities/rag-agent"
import { buildAgentMetrics } from "../agent-metrics"

const stats: AgentStats = {
  conversations: 8_942,
  conversationsChange: 0.124,
  messages30d: 38_204,
  messagesChange: -0.02,
  avgResponseMs: 1_400,
  avgResponseChangeMs: -220,
  answerAccuracy: 0.942,
  answerAccuracyChange: 0.018,
  escalationRate: 0.036,
  escalationRateChange: -0.009,
}

const byLabel = (metrics: ReturnType<typeof buildAgentMetrics>) =>
  Object.fromEntries(metrics.map((metric) => [metric.label, metric]))

describe("agent metrics", () => {
  it("judges each change by whether it is good news, not by its sign", () => {
    const metrics = byLabel(buildAgentMetrics(stats))

    expect(metrics["Conversations"]).toMatchObject({
      value: "8,942",
      change: "+12.4%",
      improved: true,
    })
    expect(metrics["Messages · 30 days"].improved).toBe(false)
    expect(metrics["Avg. response time"]).toMatchObject({
      value: "1.4s",
      change: "-220 ms",
      improved: true,
    })
    expect(metrics["Escalated to human"]).toMatchObject({
      change: "-0.9%",
      improved: true,
    })
  })

  it("shows no averages and hides flat changes for an agent without chats", () => {
    const metrics = buildAgentMetrics({
      ...stats,
      conversations: 0,
      conversationsChange: 0,
      avgResponseMs: 0,
      avgResponseChangeMs: 0,
    })
    const table = byLabel(metrics)

    expect(table["Conversations"]).toMatchObject({ value: "0", change: null })
    expect(table["Avg. response time"].value).toBe("—")
    expect(table["Answer accuracy"].value).toBe("—")
  })
})
