import { defineStore } from "pinia"
import { HttpError } from "@/shared/api"
import { ragAgentApi } from "../api/ragAgentApi"
import type { LlmModel } from "./llm-models"
import type {
  AgentConfigurationUpdate,
  ConversationDetail,
  ConversationSummary,
  CreateAgentPayload,
  RagAgent,
  TenantLimits,
  UpdateAgentPayload,
} from "./types"

export type LoadState = "idle" | "loading" | "ready" | "error"

const editableFields = (agent: RagAgent): UpdateAgentPayload => ({
  name: agent.name,
  description: agent.description,
  status: agent.status,
  model: agent.model,
  temperature: agent.temperature,
  systemPrompt: agent.systemPrompt,
  topK: agent.topK,
  similarityThreshold: agent.similarityThreshold,
})

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
    businessId: null as string | null,
    agent: null as RagAgent | null,
    agentState: "idle" as LoadState,
    conversations: [] as ConversationSummary[],
    conversationsState: "idle" as LoadState,
    details: {} as Record<string, ConversationDetail>,
    models: [] as LlmModel[],
    limits: null as TenantLimits | null,
    configurationState: "idle" as LoadState,
  }),

  actions: {
    useBusiness(businessId: string) {
      if (this.businessId === businessId) return
      this.$reset()
      this.businessId = businessId
    },

    context() {
      if (!this.businessId) throw new Error("An active business is required")
      return { businessId: this.businessId, agentId: this.agent?.id }
    },

    async loadConfiguration(businessId: string) {
      this.useBusiness(businessId)
      this.configurationState = "loading"
      try {
        await ragAgentApi.ensureTenant(businessId)
        ;[this.models, this.limits] = await Promise.all([
          ragAgentApi.listModels(businessId),
          ragAgentApi.getLimits(businessId),
        ])
        this.configurationState = "ready"
      } catch (error) {
        this.configurationState = "error"
        throw error
      }
    },

    async loadAgent(businessId: string, { force = false } = {}) {
      this.useBusiness(businessId)
      if (!force && ["loading", "ready"].includes(this.agentState)) return
      this.agentState = "loading"
      try {
        this.agent = await ragAgentApi.getAgent(businessId)
        this.agentState = "ready"
      } catch {
        this.agentState = "error"
      }
    },

    async loadConversations(businessId: string, { force = false } = {}) {
      this.useBusiness(businessId)
      if (!this.agent) {
        this.conversations = []
        this.conversationsState = "ready"
        return
      }
      if (!force && ["loading", "ready"].includes(this.conversationsState))
        return
      this.conversationsState = "loading"
      try {
        this.conversations = await ragAgentApi.listConversations(
          businessId,
          this.agent.id
        )
        this.conversationsState = "ready"
      } catch {
        this.conversationsState = "error"
      }
    },

    async loadConversation(id: string) {
      if (this.details[id]) return this.details[id]
      const { businessId, agentId } = this.context()
      if (!agentId) return null
      let detail: ConversationDetail
      try {
        detail = await ragAgentApi.getConversation(businessId, agentId, id)
      } catch (error) {
        if (error instanceof HttpError && error.status === 404) return null
        throw error
      }
      this.details[id] = detail
      return detail
    },

    async updateTags(id: string, tags: string[]) {
      const detail = this.details[id]
      if (!detail) return
      const { businessId, agentId } = this.context()
      if (!agentId) return
      const previous = detail.tags
      detail.tags = tags
      try {
        detail.tags = await ragAgentApi.updateTags(
          businessId,
          agentId,
          id,
          tags
        )
      } catch (error) {
        detail.tags = previous
        throw error
      }
    },

    async setHandover(id: string, operator: string | null) {
      const { businessId, agentId } = this.context()
      if (!agentId) return
      this.applyDetail(
        await ragAgentApi.setHandover(businessId, agentId, id, operator)
      )
    },

    async sendOperatorMessage(id: string, text: string) {
      const { businessId, agentId } = this.context()
      if (!agentId) return
      const message = await ragAgentApi.sendOperatorMessage(
        businessId,
        agentId,
        id,
        text
      )
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

    async createAgent(businessId: string, payload: CreateAgentPayload) {
      this.useBusiness(businessId)
      const agent = await ragAgentApi.createAgent(businessId, payload)
      try {
        for (const channel of payload.channels) {
          await ragAgentApi.upsertChannel(businessId, agent.id, channel)
        }
      } catch (error) {
        await ragAgentApi
          .deleteAgent(businessId, agent.id)
          .catch(() => undefined)
        throw error
      }
      const configured = await ragAgentApi.getAgentById(businessId, agent.id)
      this.$patch({
        agent: configured,
        agentState: "ready",
        conversations: [],
        conversationsState: "ready",
        details: {},
      })
      return configured
    },

    async saveConfiguration(
      businessId: string,
      update: AgentConfigurationUpdate
    ) {
      this.useBusiness(businessId)
      const agentId = this.agent?.id
      if (!agentId) throw new Error("There is no agent to update")
      try {
        if (update.agent) {
          await ragAgentApi.updateAgent(businessId, agentId, update.agent)
        }
        for (const channel of update.connect) {
          await ragAgentApi.upsertChannel(businessId, agentId, channel)
        }
        for (const kind of update.disconnect) {
          await ragAgentApi.deleteChannel(businessId, agentId, kind)
        }
      } finally {
        // Whatever went through is live now, even when a later step failed.
        this.agent = await ragAgentApi
          .getAgentById(businessId, agentId)
          .catch(() => this.agent)
      }
    },

    /** Pauses or resumes the agent without touching any unsaved edits. */
    async setAgentStatus(businessId: string, status: RagAgent["status"]) {
      this.useBusiness(businessId)
      const agent = this.agent
      if (!agent) return
      await ragAgentApi.updateAgent(businessId, agent.id, {
        ...editableFields(agent),
        status,
      })
      this.agent = await ragAgentApi.getAgentById(businessId, agent.id)
    },

    async deleteAgent(businessId: string) {
      this.useBusiness(businessId)
      const agent = this.agent
      if (!agent) return
      await ragAgentApi.deleteAgent(businessId, agent.id)
      this.$patch({
        agent: null,
        agentState: "ready",
        conversations: [],
        conversationsState: "ready",
        details: {},
      })
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
