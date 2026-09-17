import { computed, onScopeDispose, reactive, ref } from "vue"
import {
  CHANNEL_KINDS,
  ragAgentApi,
  type ChannelKind,
  type CreateAgentPayload,
  type LlmModelId,
} from "@/entities/rag-agent"
import { CHANNEL_SETUP, DEFAULT_CHANNELS } from "./channel-setup"
import { PROMPT_TOKEN_LIMIT, estimateTokens } from "./prompt"

export const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".xlsx", ".txt"]
export const MAX_FILE_BYTES = 50 * 1024 * 1024

export interface DocumentDraft {
  /** Client-side key; the server id arrives once embedding finishes. */
  key: string
  name: string
  sizeBytes: number
  status: "embedding" | "indexed" | "failed"
  /** Embedding progress, 0–1. */
  progress: number
  documentId: string | null
  chunkCount: number | null
}

export interface ChannelDraft {
  kind: ChannelKind
  enabled: boolean
  credentials: Record<string, string>
}

export interface ChecklistItem {
  key: string
  label: string
  done: boolean
  /** Optional items are suggestions and never block creation. */
  optional: boolean
}

export interface FileRejection {
  file: File
  reason: string
}

let draftSequence = 0

const channelDraft = (kind: ChannelKind, enabled = false): ChannelDraft => ({
  kind,
  enabled,
  credentials: Object.fromEntries(
    CHANNEL_SETUP[kind].fields.map((field) => [field.key, ""])
  ),
})

export const isChannelReady = (channel: ChannelDraft): boolean =>
  CHANNEL_SETUP[channel.kind].fields.every((field) =>
    field.isValid(channel.credentials[field.key] ?? "")
  )

/**
 * State and rules for the "Create your RAG agent" screen. Documents start
 * uploading as soon as they are added, so the checklist can wait for indexing
 * rather than for the submit button. Returned as one reactive object so the
 * page can bind `v-model="form.name"` directly.
 */
export function useAgentSetupForm() {
  const name = ref("")
  const description = ref("")
  const documents = ref<DocumentDraft[]>([])
  const model = ref<LlmModelId>("gpt-4o")
  const temperature = ref(0.3)
  const systemPrompt = ref("")
  const channels = ref<ChannelDraft[]>(
    DEFAULT_CHANNELS.map((kind) => channelDraft(kind))
  )

  const uploads = new Map<string, AbortController>()
  onScopeDispose(() => uploads.forEach((controller) => controller.abort()))

  const findDocument = (key: string) =>
    documents.value.find((item) => item.key === key)
  const findChannel = (kind: ChannelKind) =>
    channels.value.find((item) => item.kind === kind)

  const rejectionReason = (file: File): string | null => {
    const extension = file.name.slice(file.name.lastIndexOf(".")).toLowerCase()
    if (!ACCEPTED_EXTENSIONS.includes(extension)) return "unsupported file type"
    if (file.size > MAX_FILE_BYTES) return "larger than 50 MB"
    const duplicate = documents.value.some(
      (item) => item.name === file.name && item.sizeBytes === file.size
    )
    return duplicate ? "already added" : null
  }

  const upload = async (file: File) => {
    const key = `document-${++draftSequence}`
    const controller = new AbortController()
    uploads.set(key, controller)
    // Pushed synchronously so a duplicate later in the same batch is caught.
    documents.value.push({
      key,
      name: file.name,
      sizeBytes: file.size,
      status: "embedding",
      progress: 0,
      documentId: null,
      chunkCount: null,
    })

    try {
      const uploaded = await ragAgentApi.uploadDocument(file, {
        signal: controller.signal,
        onProgress: (ratio) => {
          const draft = findDocument(key)
          if (draft) draft.progress = ratio
        },
      })
      const draft = findDocument(key)
      if (draft) {
        draft.status = "indexed"
        draft.progress = 1
        draft.documentId = uploaded.id
        draft.chunkCount = uploaded.chunkCount
      }
    } catch {
      // Removing a document aborts its upload; that is not a failure.
      if (!controller.signal.aborted) {
        const draft = findDocument(key)
        if (draft) draft.status = "failed"
      }
    } finally {
      uploads.delete(key)
    }
  }

  /** Starts uploading every acceptable file and returns the ones skipped. */
  const addFiles = (files: Iterable<File>): FileRejection[] => {
    const rejected: FileRejection[] = []
    for (const file of files) {
      const reason = rejectionReason(file)
      if (reason) rejected.push({ file, reason })
      else void upload(file)
    }
    return rejected
  }

  const removeDocument = (key: string) => {
    uploads.get(key)?.abort()
    documents.value = documents.value.filter((item) => item.key !== key)
  }

  const setChannelEnabled = (kind: ChannelKind, enabled: boolean) => {
    const channel = findChannel(kind)
    if (channel) channel.enabled = enabled
  }

  const setCredential = (kind: ChannelKind, key: string, value: string) => {
    const channel = findChannel(kind)
    if (channel) channel.credentials[key] = value
  }

  const availableChannels = computed(() =>
    CHANNEL_KINDS.filter((kind) => !findChannel(kind))
  )

  const addChannel = (kind: ChannelKind) => {
    if (!findChannel(kind)) channels.value.push(channelDraft(kind, true))
  }

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
      required(
        "channel",
        "At least one channel connected",
        channels.value.some((item) => item.enabled && isChannelReady(item))
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
    documentIds: documents.value.flatMap((item) => item.documentId ?? []),
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
    availableChannels,
    promptTokens,
    checklist,
    missing,
    canSubmit,
    addFiles,
    removeDocument,
    setChannelEnabled,
    setCredential,
    addChannel,
    toPayload,
  })
}

export type AgentSetupForm = ReturnType<typeof useAgentSetupForm>
