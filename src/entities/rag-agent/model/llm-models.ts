import type { LlmModelId } from "./types"

export interface LlmModel {
  id: LlmModelId
  name: string
  context: string
  strength: string
}

export const LLM_MODELS: LlmModel[] = [
  {
    id: "gpt-4o",
    name: "GPT-4o",
    context: "128k context",
    strength: "fastest",
  },
  {
    id: "claude-opus-5",
    name: "Claude Opus 5",
    context: "200k context",
    strength: "best reasoning",
  },
  {
    id: "llama-3.1-70b",
    name: "Llama 3.1 70B",
    context: "Self-hosted",
    strength: "lowest cost",
  },
]

export const llmModelName = (id: LlmModelId): string =>
  LLM_MODELS.find((model) => model.id === id)?.name ?? id
