import type {
  ChannelKind,
  ConversationDetail,
  ConversationSummary,
  CreateAgentPayload,
  RagAgent,
  TenantLimits,
  UpdateAgentPayload,
  UploadedDocument,
} from "../model/types"
import type { LlmModel } from "../model/llm-models"
import { rememberLlmModels } from "../model/llm-models"
import {
  mapAgent,
  mapConversation,
  mapConversationSummary,
  mapModel,
  type AgentResponse,
  type ConversationResponse,
  type ConversationSummaryResponse,
} from "./ragMappers"
import { jsonBody, ragHttp } from "./ragHttp"

export interface DocumentResponse {
  document_id: string
  name: string
  size_bytes: number
  chunk_count: number
  status: "queued" | "processing" | "indexed" | "failed"
  progress: number
  error: string | null
}

interface UploadResponse {
  documents: Array<{
    document_id: string
    filename: string
    status: string
  }>
}

const tenantPath = (businessId: string) => `/tenants/${businessId}`
const agentPath = (businessId: string, agentId: string) =>
  `${tenantPath(businessId)}/agents/${agentId}`

export const ragAgentApi = {
  ensureTenant: (businessId: string) =>
    ragHttp(businessId, "/tenants", {
      method: "POST",
      ...jsonBody({ business_id: businessId }),
    }),

  getLimits: (businessId: string) =>
    ragHttp<TenantLimits>(businessId, `${tenantPath(businessId)}/limits`),

  async listModels(businessId: string): Promise<LlmModel[]> {
    const rows = await ragHttp<Record<string, unknown>[]>(businessId, "/models")
    const models = rows.map(mapModel)
    rememberLlmModels(models)
    return models
  },

  async getAgent(businessId: string): Promise<RagAgent | null> {
    const rows = await ragHttp<AgentResponse[]>(
      businessId,
      `${tenantPath(businessId)}/agents`
    )
    return rows[0] ? this.getAgentById(businessId, rows[0].agent_id) : null
  },

  async getAgentById(businessId: string, agentId: string): Promise<RagAgent> {
    return mapAgent(
      await ragHttp<AgentResponse>(businessId, agentPath(businessId, agentId))
    )
  },

  async createAgent(
    businessId: string,
    payload: CreateAgentPayload
  ): Promise<RagAgent> {
    const row = await ragHttp<AgentResponse>(
      businessId,
      `${tenantPath(businessId)}/agents`,
      {
        method: "POST",
        ...jsonBody({
          name: payload.name,
          description: payload.description || null,
          collections: payload.collections,
          llm_model: payload.model,
          temperature: payload.temperature,
          system_prompt: payload.systemPrompt,
        }),
      }
    )
    return mapAgent(row)
  },

  deleteAgent: (businessId: string, agentId: string) =>
    ragHttp<void>(businessId, agentPath(businessId, agentId), {
      method: "DELETE",
    }),

  async updateAgent(
    businessId: string,
    agentId: string,
    payload: UpdateAgentPayload
  ): Promise<RagAgent> {
    const row = await ragHttp<AgentResponse>(
      businessId,
      agentPath(businessId, agentId),
      {
        method: "PATCH",
        ...jsonBody({
          name: payload.name,
          description: payload.description || null,
          status: payload.status,
          llm_model: payload.model,
          temperature: payload.temperature,
          system_prompt: payload.systemPrompt,
          top_k: payload.topK,
          similarity_threshold: payload.similarityThreshold,
        }),
      }
    )
    return mapAgent(row)
  },

  chat: (
    businessId: string,
    payload: {
      agentId: string
      userId: string
      sessionId: string | null
      query: string
    }
  ) =>
    ragHttp<{
      session_id: string
      answer: string
      sources: Array<{
        chunk_id: number
        document_name: string
        rerank_score: number
      }>
      latency_ms: number
      usage: Record<string, number>
    }>(businessId, "/chat", {
      method: "POST",
      ...jsonBody({
        agent_id: payload.agentId,
        user_id: payload.userId,
        session_id: payload.sessionId,
        query: payload.query,
      }),
    }),

  upsertChannel: (
    businessId: string,
    agentId: string,
    channel: CreateAgentPayload["channels"][number]
  ) =>
    ragHttp<Record<string, unknown>>(
      businessId,
      `${agentPath(businessId, agentId)}/channels/${channel.kind}`,
      {
        method: "PUT",
        ...jsonBody({ credentials: channel.credentials, config: {} }),
      }
    ),

  deleteChannel: (businessId: string, agentId: string, kind: ChannelKind) =>
    ragHttp<void>(
      businessId,
      `${agentPath(businessId, agentId)}/channels/${kind}`,
      { method: "DELETE" }
    ),

  async listConversations(
    businessId: string,
    agentId: string
  ): Promise<ConversationSummary[]> {
    const rows = await ragHttp<ConversationSummaryResponse[]>(
      businessId,
      `${agentPath(businessId, agentId)}/conversations`
    )
    return rows.map(mapConversationSummary)
  },

  async getConversation(
    businessId: string,
    agentId: string,
    sessionId: string
  ): Promise<ConversationDetail> {
    const row = await ragHttp<ConversationResponse>(
      businessId,
      `${agentPath(businessId, agentId)}/conversations/${sessionId}`
    )
    return mapConversation(row)
  },

  async updateTags(
    businessId: string,
    agentId: string,
    sessionId: string,
    tags: string[]
  ): Promise<string[]> {
    const result = await ragHttp<{ tags: string[] }>(
      businessId,
      `${agentPath(businessId, agentId)}/conversations/${sessionId}/tags`,
      { method: "PATCH", ...jsonBody({ tags }) }
    )
    return result.tags
  },

  async setHandover(
    businessId: string,
    agentId: string,
    sessionId: string,
    operator: string | null
  ): Promise<ConversationDetail> {
    await ragHttp(
      businessId,
      `${agentPath(businessId, agentId)}/conversations/${sessionId}/handover`,
      { method: "PATCH", ...jsonBody({ operator }) }
    )
    return this.getConversation(businessId, agentId, sessionId)
  },

  async sendOperatorMessage(
    businessId: string,
    agentId: string,
    sessionId: string,
    content: string
  ) {
    const row = await ragHttp<Record<string, unknown>>(
      businessId,
      `${agentPath(businessId, agentId)}/conversations/${sessionId}/messages`,
      { method: "POST", ...jsonBody({ content }) }
    )
    return {
      id: String(row.id),
      author: "operator" as const,
      text: String(row.content),
      sentAt: String(row.created_at),
    }
  },

  async uploadDocument(
    businessId: string,
    collection: string,
    file: File,
    signal?: AbortSignal
  ): Promise<string> {
    const form = new FormData()
    form.append("files", file)
    const response = await ragHttp<UploadResponse>(
      businessId,
      `${tenantPath(businessId)}/collections/${encodeURIComponent(collection)}/documents`,
      { method: "POST", body: form, signal }
    )
    return response.documents[0].document_id
  },

  async listDocuments(
    businessId: string,
    collection: string
  ): Promise<DocumentResponse[]> {
    const response = await ragHttp<{ documents: DocumentResponse[] }>(
      businessId,
      `${tenantPath(businessId)}/collections/${encodeURIComponent(collection)}/documents`
    )
    return response.documents
  },

  deleteDocument: (businessId: string, documentId: string) =>
    ragHttp<void>(
      businessId,
      `${tenantPath(businessId)}/documents/${documentId}`,
      {
        method: "DELETE",
      }
    ),

  asUploadedDocument(document: DocumentResponse): UploadedDocument {
    return {
      id: document.document_id,
      name: document.name,
      sizeBytes: document.size_bytes,
      chunkCount: document.chunk_count,
    }
  },
}
