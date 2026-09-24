export const PROMPT_TOKEN_LIMIT = 8_000

/** ≈4 characters per token — close enough to warn before the hard limit. */
export const estimateTokens = (text: string): number =>
  Math.ceil(text.length / 4)

/** i18n key naming how the temperature behaves: factual, balanced, creative. */
export const describeTemperature = (temperature: number): string => {
  if (temperature <= 0.3) return "dashboard.rag.model.modes.factual"
  if (temperature <= 0.7) return "dashboard.rag.model.modes.balanced"
  return "dashboard.rag.model.modes.creative"
}

type Translate = (key: string, named: Record<string, unknown>) => string

/** The starter prompt, written in the interface language `t` speaks. */
export function buildPromptTemplate(
  {
    agentName,
    businessName,
  }: {
    agentName?: string
    businessName?: string
  },
  t: Translate
): string {
  return t("dashboard.rag.prompt.template", {
    identity: agentName || t("dashboard.rag.prompt.identityFallback", {}),
    business: businessName || t("dashboard.rag.prompt.businessFallback", {}),
  })
}
