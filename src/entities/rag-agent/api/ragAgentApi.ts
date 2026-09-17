import type {
  ChatMessage,
  ConversationDetail,
  ConversationSummary,
  CreateAgentPayload,
  RagAgent,
  UploadedDocument,
} from "../model/types"
import {
  AGENT_FIXTURE,
  CONVERSATION_DETAILS,
  CONVERSATION_SUMMARIES,
} from "./fixtures"

/*
 * RAG agent endpoints. The control plane does not serve them yet, so this
 * module is an in-memory stand-in: it holds the state a backend would persist
 * and answers after a short delay, which keeps the loading states honest. When
 * the API lands, replace the bodies with `apiClient` calls — the signatures
 * are the contract the store and the screens are written against.
 */

const LATENCY_MS = 250

const delay = (ms: number, signal?: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal?.aborted) return reject(signal.reason)
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true }
    )
  })

const clone = <T>(value: T): T => structuredClone(value)
const randomId = () => Math.random().toString(16).slice(2, 10)
const now = () => new Date().toISOString()

let agent: RagAgent | null = clone(AGENT_FIXTURE)
let summaries = clone(CONVERSATION_SUMMARIES)
const details = new Map(
  clone(CONVERSATION_DETAILS).map((item) => [item.id, item])
)
const uploads = new Map<string, UploadedDocument>()

const detailOrThrow = (id: string) => {
  const detail = details.get(id)
  if (!detail) throw new Error(`Conversation ${id} not found`)
  return detail
}

/** Keeps the list row in step with a conversation that just changed. */
const syncSummary = (detail: ConversationDetail) => {
  summaries = summaries.map((item) =>
    item.id === detail.id
      ? {
          ...item,
          status: detail.status,
          messageCount: detail.messageCount,
          lastMessage: detail.lastMessage,
          updatedAt: detail.updatedAt,
        }
      : item
  )
}

export const ragAgentApi = {
  async getAgent(): Promise<RagAgent | null> {
    await delay(LATENCY_MS)
    return agent && clone(agent)
  },

  async listConversations(): Promise<ConversationSummary[]> {
    await delay(LATENCY_MS)
    return clone(summaries)
  },

  async getConversation(id: string): Promise<ConversationDetail | null> {
    await delay(LATENCY_MS)
    const detail = details.get(id)
    return detail ? clone(detail) : null
  },

  async updateTags(id: string, tags: string[]): Promise<string[]> {
    await delay(LATENCY_MS / 2)
    const detail = detailOrThrow(id)
    detail.tags = [...tags]
    return clone(detail.tags)
  },

  /** A teammate (`operator`) takes the chat from the agent; `null` returns it. */
  async setHandover(
    id: string,
    operator: string | null
  ): Promise<ConversationDetail> {
    await delay(LATENCY_MS)
    const detail = detailOrThrow(id)
    detail.handoverTo = operator
    detail.status = operator ? "escalated" : "active"
    detail.updatedAt = now()
    syncSummary(detail)
    return clone(detail)
  },

  async sendOperatorMessage(id: string, text: string): Promise<ChatMessage> {
    await delay(LATENCY_MS)
    const detail = detailOrThrow(id)
    const message: ChatMessage = {
      id: `msg_${randomId()}`,
      author: "operator",
      text,
      sentAt: now(),
    }
    detail.messages.push(message)
    detail.messageCount += 1
    detail.lastMessage = text
    detail.updatedAt = message.sentAt
    syncSummary(detail)
    return clone(message)
  },

  /** Uploads and embeds a file, reporting embedding progress from 0 to 1. */
  async uploadDocument(
    file: File,
    options: { onProgress?: (ratio: number) => void; signal?: AbortSignal } = {}
  ): Promise<UploadedDocument> {
    const steps = 20
    // Bigger files embed longer, capped so a large PDF stays demoable.
    const stepMs = Math.min(220, 60 + file.size / 150_000)
    for (let step = 1; step <= steps; step += 1) {
      await delay(stepMs, options.signal)
      options.onProgress?.(step / steps)
    }
    const document: UploadedDocument = {
      id: `doc_${randomId()}`,
      name: file.name,
      sizeBytes: file.size,
      chunkCount: Math.max(1, Math.round(file.size / 15_000)),
    }
    uploads.set(document.id, document)
    return clone(document)
  },

  async createAgent(payload: CreateAgentPayload): Promise<RagAgent> {
    await delay(LATENCY_MS * 2)
    const documents = payload.documentIds.flatMap((id) => uploads.get(id) ?? [])
    agent = {
      id: `agent_${randomId()}`,
      name: payload.name,
      description: payload.description,
      status: "live",
      model: payload.model,
      temperature: payload.temperature,
      documentCount: documents.length,
      chunkCount: documents.reduce((sum, item) => sum + item.chunkCount, 0),
      channels: payload.channels.map((channel) => channel.kind),
      syncedAt: now(),
      stats: {
        conversations: 0,
        conversationsChange: 0,
        messages30d: 0,
        messagesChange: 0,
        avgResponseMs: 0,
        avgResponseChangeMs: 0,
        answerAccuracy: 0,
        answerAccuracyChange: 0,
        escalationRate: 0,
        escalationRateChange: 0,
      },
    }
    // One agent per business: the replacement starts with an empty history.
    summaries = []
    details.clear()
    return clone(agent)
  },
}
