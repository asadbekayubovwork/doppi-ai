import { defineStore } from "pinia"
import { ragAgentApi } from "../api/ragAgentApi"
import type {
  ConversationDetail,
  ConversationSummary,
  CreateAgentPayload,
  RagAgent,
} from "./types"

export type LoadState = "idle" | "loading" | "ready" | "error"

const toSummary = (detail: ConversationDetail): ConversationSummary => ({
  id: detail.id,
  channel: detail.channel,
  lastMessage: detail.lastMessage,
  messageCount: detail.messageCount,
  status: detail.status,
  updatedAt: detail.updatedAt,
})

export const useRagAgentStore = defineStore("rag-agent", {
  state: () => ({
    agent: null as RagAgent | null,
    agentState: "idle" as LoadState,
    conversations: [] as ConversationSummary[],
    conversationsState: "idle" as LoadState,
    /** Conversations opened this session, by id. */
    details: {} as Record<string, ConversationDetail>,
  }),

  actions: {
    // Loads settle into `error` rather than throwing, because the screens
    // render that state. Mutations throw so the caller can report the failure.
    async loadAgent({ force = false } = {}) {
      if (!force && ["loading", "ready"].includes(this.agentState)) return
      this.agentState = "loading"
      try {
        this.agent = await ragAgentApi.getAgent()
        this.agentState = "ready"
      } catch {
        this.agentState = "error"
      }
    },

    async loadConversations({ force = false } = {}) {
      if (!force && ["loading", "ready"].includes(this.conversationsState)) {
        return
      }
      this.conversationsState = "loading"
      try {
        this.conversations = await ragAgentApi.listConversations()
        this.conversationsState = "ready"
      } catch {
        this.conversationsState = "error"
      }
    },

    async loadConversation(id: string) {
      if (this.details[id]) return this.details[id]
      const detail = await ragAgentApi.getConversation(id)
      if (detail) this.details[id] = detail
      return detail
    },

    async updateTags(id: string, tags: string[]) {
      const detail = this.details[id]
      if (!detail) return
      const previous = detail.tags
      detail.tags = tags
      try {
        detail.tags = await ragAgentApi.updateTags(id, tags)
      } catch (error) {
        detail.tags = previous
        throw error
      }
    },

    async setHandover(id: string, operator: string | null) {
      this.applyDetail(await ragAgentApi.setHandover(id, operator))
    },

    async sendOperatorMessage(id: string, text: string) {
      const message = await ragAgentApi.sendOperatorMessage(id, text)
      const detail = this.details[id]
      if (!detail) return
      this.applyDetail({
        ...detail,
        messages: [...detail.messages, message],
        messageCount: detail.messageCount + 1,
        lastMessage: message.text,
        updatedAt: message.sentAt,
      })
    },

    async createAgent(payload: CreateAgentPayload) {
      const agent = await ragAgentApi.createAgent(payload)
      this.$patch({
        agent,
        agentState: "ready",
        conversations: [],
        conversationsState: "ready",
        details: {},
      })
      return agent
    },

    applyDetail(detail: ConversationDetail) {
      this.details[detail.id] = detail
      const index = this.conversations.findIndex(
        (item) => item.id === detail.id
      )
      if (index >= 0) this.conversations[index] = toSummary(detail)
    },
  },
})
