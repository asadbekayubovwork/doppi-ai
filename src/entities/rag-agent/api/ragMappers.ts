import type { LlmModel } from "../model/llm-models"
import type {
  ChatMessage,
  ConversationDetail,
  ConversationStatus,
  ConversationSummary,
  RagAgent,
  RetrievedSource,
} from "../model/types"

export interface AgentResponse {
  agent_id: string
  name: string
  description: string | null
  status: "live" | "paused"
  llm_model: string
  temperature: number
  system_prompt: string | null
  top_k: number
  similarity_threshold: number
  collections?: string[]
  created_at: string
  updated_at: string
  channels?: Array<"instagram" | "telegram" | "whatsapp" | "web">
  stats?: {
    conversations?: number
    messages?: number
    documents?: number
    chunks?: number
  }
}

export interface ConversationSummaryResponse {
  session_id: string
  channel: string
  last_message: string | null
  message_count: number
  status: string
  updated_at: string
}

interface MessageResponse {
  id: string | number
  role: "user" | "assistant" | "operator"
  content: string
  sources: Array<{
    chunk_id: number
    document_name: string
    content: string
    vector_similarity: number
    rerank_score: number
  }> | null
  usage: Record<string, unknown> | null
  created_at: string
}

export interface ConversationResponse {
  session_id: string
  user_id: string
  status: string
  channel: string
  title: string | null
  tags: string[]
  handover_to: string | null
  created_at: string
  updated_at: string
  messages: MessageResponse[]
}

const channel = (value: string) =>
  (["instagram", "telegram", "whatsapp", "web"] as const).find(
    (item) => item === value
  ) ?? "web"

const status = (value: string): ConversationStatus =>
  (["active", "resolved", "escalated"] as const).find(
    (item) => item === value
  ) ?? "active"

export const mapModel = (row: Record<string, unknown>): LlmModel => ({
  id: String(row.id),
  displayName: String(row.display_name),
  provider: String(row.provider),
  contextTokens: Number(row.context_tokens),
  inputUsdPerMillion:
    row.input_usd_per_million === null
      ? null
      : String(row.input_usd_per_million),
  outputUsdPerMillion:
    row.output_usd_per_million === null
      ? null
      : String(row.output_usd_per_million),
  currency: String(row.currency),
  pricingConfigured: Boolean(row.pricing_configured),
  isDefault: Boolean(row.is_default),
  capabilities: (row.capabilities as Record<string, unknown>) ?? {},
})

export const mapAgent = (row: AgentResponse): RagAgent => ({
  id: row.agent_id,
  name: row.name,
  description: row.description ?? "",
  status: row.status,
  model: row.llm_model,
  temperature: row.temperature,
  systemPrompt: row.system_prompt ?? "",
  collections: row.collections ?? [],
  topK: row.top_k,
  similarityThreshold: row.similarity_threshold,
  documentCount: row.stats?.documents ?? 0,
  chunkCount: row.stats?.chunks ?? 0,
  channels: row.channels ?? [],
  syncedAt: row.updated_at,
  stats: {
    conversations: row.stats?.conversations ?? 0,
    conversationsChange: 0,
    messages30d: row.stats?.messages ?? 0,
    messagesChange: 0,
    avgResponseMs: 0,
    avgResponseChangeMs: 0,
    answerAccuracy: 0,
    answerAccuracyChange: 0,
    escalationRate: 0,
    escalationRateChange: 0,
  },
})

export const mapConversationSummary = (
  row: ConversationSummaryResponse
): ConversationSummary => ({
  id: row.session_id,
  channel: channel(row.channel),
  lastMessage: row.last_message ?? "",
  messageCount: row.message_count,
  status: status(row.status),
  updatedAt: row.updated_at,
})

const mapMessage = (row: MessageResponse): ChatMessage => ({
  id: String(row.id),
  author:
    row.role === "user"
      ? "customer"
      : row.role === "assistant"
        ? "agent"
        : "operator",
  text: row.content,
  sentAt: row.created_at,
  citations: row.sources?.map((source) => ({
    document: source.document_name,
    location: `chunk ${source.chunk_id}`,
    chunkId: source.chunk_id,
    excerpt: source.content,
    vectorSimilarity: Number(source.vector_similarity),
    rerankScore: Number(source.rerank_score),
  })),
})

const retrievedSources = (messages: MessageResponse[]): RetrievedSource[] => {
  const sources = new Map<string, RetrievedSource>()
  for (const message of messages) {
    for (const source of message.sources ?? []) {
      const current = sources.get(source.document_name)
      sources.set(source.document_name, {
        document: source.document_name,
        chunksUsed: (current?.chunksUsed ?? 0) + 1,
        score: Math.max(current?.score ?? 0, Number(source.rerank_score ?? 0)),
        chunks: [
          ...(current?.chunks ?? []),
          {
            chunkId: source.chunk_id,
            content: source.content,
            vectorSimilarity: Number(source.vector_similarity),
            rerankScore: Number(source.rerank_score),
          },
        ],
      })
    }
  }
  return [...sources.values()]
}

export const mapConversation = (
  row: ConversationResponse
): ConversationDetail => ({
  ...mapConversationSummary({
    session_id: row.session_id,
    channel: row.channel,
    last_message: row.messages.at(-1)?.content ?? null,
    message_count: row.messages.length,
    status: row.status,
    updated_at: row.updated_at,
  }),
  customer: { name: row.user_id, contact: row.user_id },
  startedAt: row.created_at,
  agentMessageCount: row.messages.filter(
    (message) => message.role === "assistant"
  ).length,
  handledBy: "RAG agent",
  handoverTo: row.handover_to,
  messages: row.messages.map(mapMessage),
  retrievedSources: retrievedSources(row.messages),
  tags: row.tags ?? [],
  rating: null,
})
