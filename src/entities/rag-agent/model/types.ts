export type ChannelKind = "instagram" | "telegram" | "whatsapp" | "web"

export type ConversationStatus = "active" | "resolved" | "escalated"

export type LlmModelId = string

/** Changes are relative to the previous 30-day window. Ratios are 0–1. */
export interface AgentStats {
  conversations: number
  conversationsChange: number
  messages30d: number
  messagesChange: number
  avgResponseMs: number
  avgResponseChangeMs: number
  answerAccuracy: number
  answerAccuracyChange: number
  escalationRate: number
  escalationRateChange: number
}

export interface RagAgent {
  id: string
  name: string
  description: string
  status: "live" | "paused"
  model: LlmModelId
  temperature: number
  systemPrompt: string
  collections: string[]
  topK: number
  similarityThreshold: number
  documentCount: number
  chunkCount: number
  channels: ChannelKind[]
  syncedAt: string
  stats: AgentStats
}

export interface ConversationSummary {
  id: string
  channel: ChannelKind
  lastMessage: string
  messageCount: number
  status: ConversationStatus
  updatedAt: string
}

export interface SourceCitation {
  document: string
  /** Where in the document the answer came from: "sheet 1", "p.14", "§4". */
  location: string
  chunkId: number
  excerpt: string
  vectorSimilarity: number
  rerankScore: number
}

export interface AnswerTrace {
  model: LlmModelId
  latencyMs: number
  chunks: number
}

export interface ChatMessage {
  id: string
  /** `operator` is a teammate who took the chat over from the agent. */
  author: "customer" | "agent" | "operator"
  text: string
  sentAt: string
  citations?: SourceCitation[]
  trace?: AnswerTrace
  feedback?: "positive" | "negative"
}

export interface RetrievedSource {
  document: string
  chunksUsed: number
  /** Retrieval similarity, 0–1. */
  score: number
  chunks: Array<{
    chunkId: number
    content: string
    vectorSimilarity: number
    rerankScore: number
  }>
}

export interface CustomerRating {
  score: number
  outOf: number
  comment?: string
}

export interface ConversationDetail extends ConversationSummary {
  customer: { name: string; contact: string }
  startedAt: string
  agentMessageCount: number
  handledBy: string
  /** Who took the chat over from the agent; `null` while the agent answers. */
  handoverTo: string | null
  messages: ChatMessage[]
  retrievedSources: RetrievedSource[]
  tags: string[]
  rating: CustomerRating | null
}

export interface UploadedDocument {
  id: string
  name: string
  sizeBytes: number
  chunkCount: number
}

export interface CreateAgentPayload {
  name: string
  description: string
  collections: string[]
  model: LlmModelId
  temperature: number
  systemPrompt: string
  channels: Array<{ kind: ChannelKind; credentials: Record<string, string> }>
}

export interface UpdateAgentPayload {
  name: string
  description: string
  status: RagAgent["status"]
  model: LlmModelId
  temperature: number
  systemPrompt: string
  topK: number
  similarityThreshold: number
}

/** One "Save changes" on the configuration screen. */
export interface AgentConfigurationUpdate {
  /** `null` leaves the agent's own fields untouched. */
  agent: UpdateAgentPayload | null
  /** Channels to create or give new credentials. */
  connect: CreateAgentPayload["channels"]
  disconnect: ChannelKind[]
}

export interface TenantLimits {
  max_documents: number
  max_storage_bytes: number
  max_agents: number
  monthly_queries: number
  monthly_tokens: number
  monthly_cost_microusd: number | null
  max_file_bytes: number
  max_files_per_request: number
  max_pdf_pages: number
  query_rate_per_minute: number
  upload_rate_per_minute: number
}
