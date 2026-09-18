export interface LlmModel {
  id: string
  displayName: string
  provider: string
  contextTokens: number
  inputUsdPerMillion: string | null
  outputUsdPerMillion: string | null
  currency: string
  pricingConfigured: boolean
  isDefault: boolean
  capabilities: Record<string, unknown>
}

const modelNames = new Map<string, string>()

export const rememberLlmModels = (models: LlmModel[]) => {
  modelNames.clear()
  for (const model of models) modelNames.set(model.id, model.displayName)
}

export const llmModelName = (id: string): string => modelNames.get(id) ?? id
