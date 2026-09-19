import { computed, reactive, ref } from "vue"
import type { CreateAgentPayload, LlmModelId } from "@/entities/rag-agent"
import { CHANNEL_SETUP, DEFAULT_CHANNELS } from "./channel-setup"
import {
  channelDraft,
  isChannelReady,
  useChannelDrafts,
} from "./channel-drafts"
import { PROMPT_TOKEN_LIMIT, estimateTokens } from "./prompt"
import { useKnowledgeDocuments } from "./useKnowledgeDocuments"

export interface ChecklistItem {
  key: string
  label: string
  done: boolean
  /** Optional items are suggestions and never block creation. */
  optional: boolean
}

const newCollectionName = () => {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `knowledge-${id}`
}

/**
 * State and rules for the "Create your RAG agent" screen. Documents start
 * uploading as soon as they are added, so the checklist can wait for indexing
 * rather than for the submit button. Returned as one reactive object so the
 * page can bind `v-model="form.name"` directly.
 */
export function useAgentSetupForm(businessId: string | (() => string)) {
  const currentBusinessId = () =>
    typeof businessId === "function" ? businessId() : businessId
  const name = ref("")
  const description = ref("")
  const model = ref<LlmModelId>("")
  const temperature = ref(0.3)
  const systemPrompt = ref("")
  const collection = ref(newCollectionName())
  const knowledge = useKnowledgeDocuments(currentBusinessId, () => [
    collection.value,
  ])
  const { documents, maxFileBytes } = knowledge
  const channelList = useChannelDrafts(
    DEFAULT_CHANNELS.map((kind) => channelDraft(kind))
  )
  const { channels } = channelList

  const promptTokens = computed(() => estimateTokens(systemPrompt.value))

  const checklist = computed<ChecklistItem[]>(() => {
    const required = (key: string, label: string, done: boolean) => ({
      key,
      label,
      done,
      optional: false,
    })

    const items: ChecklistItem[] = [
      required("name", "Agent name", name.value.trim().length > 0),
      required(
        "documents",
        "Documents uploaded & indexed",
        documents.value.length > 0 &&
          documents.value.every((item) => item.status === "indexed")
      ),
      required("model", "LLM model selected", Boolean(model.value)),
      required(
        "prompt",
        "System prompt written",
        systemPrompt.value.trim().length > 0 &&
          promptTokens.value <= PROMPT_TOKEN_LIMIT
      ),
    ]

    // A channel switched on without valid credentials would fail at launch,
    // so it blocks; one left off is only a suggestion.
    for (const channel of channels.value) {
      if (channel.enabled && isChannelReady(channel)) continue
      items.push({
        key: `channel-${channel.kind}`,
        label: `${CHANNEL_SETUP[channel.kind].title} credentials`,
        done: false,
        optional: !channel.enabled,
      })
    }

    return items
  })

  const missing = computed(() =>
    checklist.value.filter((item) => !item.done && !item.optional)
  )
  const canSubmit = computed(() => missing.value.length === 0)

  const toPayload = (): CreateAgentPayload => ({
    name: name.value.trim(),
    description: description.value.trim(),
    collections: [collection.value],
    model: model.value,
    temperature: temperature.value,
    systemPrompt: systemPrompt.value.trim(),
    channels: channels.value
      .filter((item) => item.enabled)
      .map((item) => ({
        kind: item.kind,
        credentials: { ...item.credentials },
      })),
  })

  return reactive({
    name,
    description,
    documents,
    model,
    temperature,
    systemPrompt,
    channels,
    collection,
    maxFileBytes,
    availableChannels: channelList.availableChannels,
    promptTokens,
    checklist,
    missing,
    canSubmit,
    addFiles: knowledge.addFiles,
    removeDocument: knowledge.removeDocument,
    setChannelEnabled: channelList.setChannelEnabled,
    setCredential: channelList.setCredential,
    addChannel: channelList.addChannel,
    toPayload,
    configureLimits: (value: number) => (maxFileBytes.value = value),
  })
}

export type AgentSetupForm = ReturnType<typeof useAgentSetupForm>
