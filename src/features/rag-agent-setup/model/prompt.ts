export const PROMPT_TOKEN_LIMIT = 8_000

/** ≈4 characters per token — close enough to warn before the hard limit. */
export const estimateTokens = (text: string): number =>
  Math.ceil(text.length / 4)

export const describeTemperature = (temperature: number): string => {
  if (temperature <= 0.3) return "factual"
  if (temperature <= 0.7) return "balanced"
  return "creative"
}

export function buildPromptTemplate({
  agentName,
  businessName,
}: {
  agentName?: string
  businessName?: string
}): string {
  const identity = agentName || "the support agent"
  const business = businessName || "our store"
  return [
    `You are ${identity}, the support agent for ${business}.`,
    "",
    "• Answer only from the knowledge base. Never invent prices, terms or stock.",
    "• Reply in the language the customer writes in (UZ / RU / EN).",
    "• Always cite the document you used.",
    "• If the documents don't cover the question, say so and hand the chat to a human.",
  ].join("\n")
}
