import { computed, reactive, ref, shallowRef } from "vue"
import {
  CHANNEL_KINDS,
  type AgentConfigurationUpdate,
  type LlmModelId,
  type RagAgent,
} from "@/entities/rag-agent"
import { CHANNEL_SETUP, DEFAULT_CHANNELS } from "./channel-setup"
import {
  channelDraft,
  hasTypedCredentials,
  isChannelReady,
  useChannelDrafts,
  type ChannelDraft,
} from "./channel-drafts"
import { PROMPT_TOKEN_LIMIT, estimateTokens } from "./prompt"
import { useKnowledgeDocuments } from "./useKnowledgeDocuments"

export const TOP_K_RANGE = { min: 1, max: 32 }
export const SIMILARITY_RANGE = { min: -1, max: 1 }

export type SettingsSection = "identity" | "model" | "prompt" | "channels"

export interface SettingsChange {
  key: string
  /** Short name for the "unsaved draft" summary: "Prompt", "WhatsApp". */
  label: string
  section: SettingsSection
}

const inRange = (value: unknown, { min, max }: { min: number; max: number }) =>
  typeof value === "number" && value >= min && value <= max

/** A connected channel goes back to the server only with new credentials. */
const needsConnect = (channel: ChannelDraft) =>
  channel.enabled && (!channel.connected || hasTypedCredentials(channel))

const needsDisconnect = (channel: ChannelDraft) =>
  channel.connected && !channel.enabled

/** Default channels first, then any other one the agent is already on. */
const channelsOf = (agent: RagAgent) =>
  CHANNEL_KINDS.filter(
    (kind) => DEFAULT_CHANNELS.includes(kind) || agent.channels.includes(kind)
  ).map((kind) => {
    const connected = agent.channels.includes(kind)
    return channelDraft(kind, { enabled: connected, connected })
  })

/**
 * State and rules for the "Edit configuration" screen: a draft of the live
 * agent, the list of what differs from it and the update that saves it.
 * Documents are not part of the draft — like on the create screen they upload
 * and delete as soon as the user asks.
 */
export function useAgentSettingsForm(businessId: string | (() => string)) {
  const currentBusinessId = () =>
    typeof businessId === "function" ? businessId() : businessId
  const saved = shallowRef<RagAgent | null>(null)
  const name = ref("")
  const description = ref("")
  const model = ref<LlmModelId>("")
  const temperature = ref(0.3)
  const topK = ref(8)
  const similarityThreshold = ref(0.1)
  const systemPrompt = ref("")
  const knowledge = useKnowledgeDocuments(
    currentBusinessId,
    () => saved.value?.collections ?? []
  )
  const channelList = useChannelDrafts([])
  const { channels } = channelList

  /** Loads `agent` as both the saved version and the draft. */
  const reset = (agent: RagAgent) => {
    saved.value = agent
    name.value = agent.name
    description.value = agent.description
    model.value = agent.model
    temperature.value = agent.temperature
    topK.value = agent.topK
    similarityThreshold.value = agent.similarityThreshold
    systemPrompt.value = agent.systemPrompt
    channels.value = channelsOf(agent)
  }

  /**
   * Moves the saved version to `agent` but keeps the draft, so whatever a
   * partly failed save did not apply stays pending.
   */
  const rebase = (agent: RagAgent) => {
    saved.value = agent
    for (const channel of channels.value) {
      channel.connected = agent.channels.includes(channel.kind)
    }
    for (const kind of agent.channels) {
      if (channels.value.some((item) => item.kind === kind)) continue
      channels.value.push(
        channelDraft(kind, { enabled: true, connected: true })
      )
    }
  }

  const discard = () => {
    if (saved.value) reset(saved.value)
  }

  const revertPrompt = () => {
    if (saved.value) systemPrompt.value = saved.value.systemPrompt
  }

  const promptTokens = computed(() => estimateTokens(systemPrompt.value))

  const changes = computed<SettingsChange[]>(() => {
    const agent = saved.value
    if (!agent) return []
    const fields: Array<[string, string, SettingsSection, boolean]> = [
      ["name", "Name", "identity", name.value.trim() !== agent.name],
      [
        "description",
        "Description",
        "identity",
        description.value.trim() !== agent.description,
      ],
      ["model", "Model", "model", model.value !== agent.model],
      [
        "temperature",
        "Temperature",
        "model",
        temperature.value !== agent.temperature,
      ],
      ["topK", "Retrieved chunks", "model", topK.value !== agent.topK],
      [
        "similarityThreshold",
        "Similarity threshold",
        "model",
        similarityThreshold.value !== agent.similarityThreshold,
      ],
      [
        "prompt",
        "Prompt",
        "prompt",
        systemPrompt.value.trim() !== agent.systemPrompt.trim(),
      ],
    ]
    const list: SettingsChange[] = fields
      .filter(([, , , changed]) => changed)
      .map(([key, label, section]) => ({ key, label, section }))
    for (const channel of channels.value) {
      if (!needsConnect(channel) && !needsDisconnect(channel)) continue
      list.push({
        key: `channel-${channel.kind}`,
        label: CHANNEL_SETUP[channel.kind].title,
        section: "channels",
      })
    }
    return list
  })

  const changedSections = computed(
    () => new Set(changes.value.map((item) => item.section))
  )

  /** What stops the draft from saving, as short labels for a toast. */
  const problems = computed(() => {
    const list: string[] = []
    if (!name.value.trim()) list.push("Agent name")
    if (!model.value) list.push("LLM model")
    if (promptTokens.value > PROMPT_TOKEN_LIMIT) list.push("System prompt")
    if (!Number.isInteger(topK.value) || !inRange(topK.value, TOP_K_RANGE))
      list.push("Retrieved chunks")
    if (!inRange(similarityThreshold.value, SIMILARITY_RANGE))
      list.push("Similarity threshold")
    for (const channel of channels.value) {
      if (needsConnect(channel) && !isChannelReady(channel))
        list.push(`${CHANNEL_SETUP[channel.kind].title} credentials`)
    }
    return list
  })

  const toUpdate = (): AgentConfigurationUpdate => {
    const agentChanged = changes.value.some(
      (item) => item.section !== "channels"
    )
    return {
      agent:
        agentChanged && saved.value
          ? {
              name: name.value.trim(),
              description: description.value.trim(),
              status: saved.value.status,
              model: model.value,
              temperature: temperature.value,
              systemPrompt: systemPrompt.value.trim(),
              topK: topK.value,
              similarityThreshold: similarityThreshold.value,
            }
          : null,
      connect: channels.value.filter(needsConnect).map((item) => ({
        kind: item.kind,
        credentials: { ...item.credentials },
      })),
      disconnect: channels.value
        .filter(needsDisconnect)
        .map((item) => item.kind),
    }
  }

  return reactive({
    saved,
    name,
    description,
    model,
    temperature,
    topK,
    similarityThreshold,
    systemPrompt,
    promptTokens,
    documents: knowledge.documents,
    maxFileBytes: knowledge.maxFileBytes,
    channels,
    availableChannels: channelList.availableChannels,
    changes,
    changedSections,
    problems,
    reset,
    rebase,
    discard,
    revertPrompt,
    toUpdate,
    loadDocuments: knowledge.load,
    addFiles: knowledge.addFiles,
    removeDocument: knowledge.removeDocument,
    setChannelEnabled: channelList.setChannelEnabled,
    setCredential: channelList.setCredential,
    addChannel: channelList.addChannel,
    configureLimits: (value: number) => (knowledge.maxFileBytes.value = value),
  })
}

export type AgentSettingsForm = ReturnType<typeof useAgentSettingsForm>
