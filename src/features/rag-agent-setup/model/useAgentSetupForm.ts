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
  error: string | null
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
const newCollectionName = () => {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`
  return `knowledge-${id}`
}

const pause = (milliseconds: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = window.setTimeout(resolve, milliseconds)
    signal.addEventListener(
      "abort",
      () => {
        window.clearTimeout(timer)
        reject(signal.reason)
      },
      { once: true }
    )
  })

export function useAgentSetupForm(businessId: string | (() => string)) {
  const currentBusinessId = () =>
    typeof businessId === "function" ? businessId() : businessId
  const name = ref("")
  const description = ref("")
  const documents = ref<DocumentDraft[]>([])
  const model = ref<LlmModelId>("")
  const temperature = ref(0.3)
  const systemPrompt = ref("")
  const collection = ref(newCollectionName())
  const maxFileBytes = ref<number | null>(null)
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
    if (maxFileBytes.value === null) return "configuration is still loading"
    if (file.size > maxFileBytes.value)
      return "larger than the configured limit"
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
      error: null,
    })

    try {
      const documentId = await ragAgentApi.uploadDocument(
        currentBusinessId(),
        collection.value,
        file,
        controller.signal
      )
      const uploaded = findDocument(key)
      if (uploaded) {
        uploaded.documentId = documentId
        uploaded.progress = 0.05
      }
      while (!controller.signal.aborted) {
        const rows = await ragAgentApi.listDocuments(
          currentBusinessId(),
          collection.value
        )
        const row = rows.find((item) => item.document_id === documentId)
        if (!row) throw new Error("Uploaded document disappeared")
        const draft = findDocument(key)
        if (!draft) return
        draft.progress =
          row.status === "processing"
            ? Math.max(0.1, row.progress)
            : row.progress
        draft.chunkCount = row.chunk_count
        draft.error = row.error
        if (row.status === "indexed") {
          draft.status = "indexed"
          draft.progress = 1
          return
        }
        if (row.status === "failed")
          throw new Error(row.error || "Indexing failed")
        await pause(1000, controller.signal)
      }
    } catch (error) {
      // Removing a document aborts its upload; that is not a failure.
      if (!controller.signal.aborted) {
        const draft = findDocument(key)
        if (draft) {
          draft.status = "failed"
          draft.error =
            error instanceof Error ? error.message : "Indexing failed"
        }
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
    const document = findDocument(key)
    uploads.get(key)?.abort()
    documents.value = documents.value.filter((item) => item.key !== key)
    if (document?.documentId) {
      void ragAgentApi.deleteDocument(currentBusinessId(), document.documentId)
    }
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
    configureLimits: (value: number) => (maxFileBytes.value = value),
  })
}

export type AgentSetupForm = ReturnType<typeof useAgentSetupForm>
