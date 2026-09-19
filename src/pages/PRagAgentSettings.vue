<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useHead } from "@unhead/vue"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { useRagAgentStore } from "@/entities/rag-agent"
import { messageForProblem, useAuthStore } from "@/features/auth"
import {
  ACCEPTED_EXTENSIONS,
  CAgentIdentitySection,
  CChangeHistory,
  CChannelsSection,
  CKnowledgeBaseSection,
  CLlmModelSection,
  CRetrievalFields,
  CSystemPromptSection,
  PROMPT_TOKEN_LIMIT,
  useAgentSettingsForm,
  type ChangeHistoryEntry,
  type SettingsSection,
} from "@/features/rag-agent-setup"
import {
  formatCount,
  formatTimeAgo,
  usePageHeading,
  useToast,
} from "@/shared/lib"
import { CAppButton, CBadge, CEmptyState, CIcon, CSkeleton } from "@/shared/ui"

useHead({ title: "Edit RAG agent — Do'ppi AI" })

/** Something done on this visit, listed in the change history. */
interface Activity {
  key: string
  icon: string
  title: string
  detail: string
  at: number
}

const auth = useAuthStore()
const store = useRagAgentStore()
const router = useRouter()
const toast = useToast()
const businessId = computed(() => auth.activeBusiness?.id ?? "")
const form = useAgentSettingsForm(() => businessId.value)
const agent = computed(() => store.agent)
const isSaving = ref(false)
const isChangingStatus = ref(false)
const isDeleting = ref(false)
const activity = ref<Activity[]>([])
let activitySequence = 0
// Document counts on the agent page come from the server, so refresh them
// on the way out once an upload or removal happened here.
let documentsChanged = false

// Keeps the relative times in the history moving.
const now = ref(Date.now())
const clock = window.setInterval(() => (now.value = Date.now()), 30_000)

const plural = (count: number, noun: string) =>
  `${formatCount(count)} ${noun}${count === 1 ? "" : "s"}`

const ago = (date: string | number) => {
  const age = formatTimeAgo(new Date(date), now.value)
  return age === "now" ? "now" : `${age} ago`
}

const changed = (section: SettingsSection) => form.changedSections.has(section)

const log = (icon: string, title: string, detail = "You") => {
  activity.value.push({
    key: `activity-${++activitySequence}`,
    icon,
    title,
    detail,
    at: Date.now(),
  })
}

const load = async () => {
  if (!businessId.value) return
  void store.loadAgent(businessId.value, {
    force: store.agentState === "error",
  })
  try {
    await store.loadConfiguration(businessId.value)
    if (store.limits) form.configureLimits(store.limits.max_file_bytes)
  } catch (error) {
    toast.error(
      "Couldn't load RAG configuration",
      messageForProblem(error, "Try again in a moment.")
    )
  }
}

const loadDocuments = async () => {
  try {
    await form.loadDocuments()
  } catch (error) {
    toast.error(
      "Couldn't load the knowledge base",
      messageForProblem(error, "Try again in a moment.")
    )
  }
}

// The agent can arrive from a load another page started, so follow the store
// rather than this page's own request.
watch(
  () => store.agent?.id,
  () => {
    if (!store.agent) return
    form.reset(store.agent)
    activity.value = []
    void loadDocuments()
  },
  { immediate: true }
)

watch(businessId, () => void load())

usePageHeading(() => {
  if (!agent.value) return {}
  const draft = form.changes.length ? " · draft" : ""
  return { subtitle: `${agent.value.name} · editing configuration${draft}` }
})

const knowledgeHint = computed(() => {
  const chunks = form.documents.reduce(
    (sum, item) =>
      sum + (item.status === "indexed" ? (item.chunkCount ?? 0) : 0),
    0
  )
  return `${plural(form.documents.length, "document")} · ${plural(chunks, "chunk")} · uploads apply right away`
})

const embeddingNotice = computed(() => {
  const count = (status: string) =>
    form.documents.filter((item) => item.status === status).length
  const embedding = count("embedding")
  if (!embedding) return null
  return `${plural(embedding, "document")} still embedding — the agent answers from the ${plural(count("indexed"), "indexed document")} meanwhile.`
})

const history = computed<ChangeHistoryEntry[]>(() => {
  const entries: ChangeHistoryEntry[] = []
  if (form.changes.length) {
    entries.push({
      key: "draft",
      icon: "circle-dot",
      tone: "warning",
      title: "Unsaved draft",
      detail: form.changes.map((item) => item.label).join(", "),
      time: "now",
    })
  }
  for (const item of activity.value.slice(-4).reverse()) {
    entries.push({
      key: item.key,
      icon: item.icon,
      tone: "accent",
      title: item.title,
      detail: item.detail,
      time: ago(item.at),
    })
  }
  if (agent.value) {
    entries.push({
      key: "live",
      icon: "history",
      tone: "neutral",
      title: "Live configuration",
      detail: "Last updated on the server",
      time: ago(agent.value.syncedAt),
    })
  }
  return entries
})

const addFiles = (files: File[]) => {
  const rejected = form.addFiles(files)
  for (const file of files) {
    if (rejected.some((item) => item.file === file)) continue
    documentsChanged = true
    log("upload", `${file.name} added`)
  }
  if (!rejected.length) return
  toast.warning(
    rejected.length === 1
      ? "1 file skipped"
      : `${rejected.length} files skipped`,
    rejected.map(({ file, reason }) => `${file.name} — ${reason}`).join("\n")
  )
}

const removeDocument = (key: string) => {
  const document = form.documents.find((item) => item.key === key)
  if (!document) return
  // Uploaded documents are live; one still uploading is just cancelled.
  if (
    document.documentId &&
    !window.confirm(
      `Remove ${document.name} from the knowledge base? The agent stops using it right away.`
    )
  ) {
    return
  }
  form.removeDocument(key)
  documentsChanged = true
  log("x", `${document.name} removed`)
}

const save = async () => {
  if (!form.changes.length) return
  if (form.problems.length) {
    toast.warning("Fix these before saving", form.problems.join(", "))
    return
  }
  const labels = form.changes.map((item) => item.label).join(", ")
  isSaving.value = true
  try {
    await store.saveConfiguration(businessId.value, form.toUpdate())
    if (store.agent) form.reset(store.agent)
    log("check", "Configuration saved", labels)
    toast.success(
      "Changes saved",
      "New conversations use the updated configuration."
    )
  } catch (error) {
    // Whatever did save is now the baseline; the rest stays in the draft.
    if (store.agent) form.rebase(store.agent)
    toast.error(
      "Couldn't save every change",
      messageForProblem(error, "Try again in a moment.")
    )
  } finally {
    isSaving.value = false
  }
}

const discard = () => {
  const count = form.changes.length
  if (!count || !window.confirm(`Discard ${plural(count, "unsaved change")}?`))
    return
  form.discard()
}

const toggleStatus = async () => {
  if (!agent.value) return
  const next = agent.value.status === "live" ? "paused" : "live"
  isChangingStatus.value = true
  try {
    await store.setAgentStatus(businessId.value, next)
    if (store.agent) form.rebase(store.agent)
    const title = next === "live" ? "Agent resumed" : "Agent paused"
    log(next === "live" ? "play" : "pause", title)
    toast.success(
      title,
      next === "live"
        ? "It answers new messages again."
        : "It stops answering until you resume it."
    )
  } catch (error) {
    toast.error(
      "Couldn't change the agent status",
      messageForProblem(error, "Try again in a moment.")
    )
  } finally {
    isChangingStatus.value = false
  }
}

const remove = async () => {
  if (
    !window.confirm(
      "Delete this agent and all of its conversations? This can't be undone."
    )
  ) {
    return
  }
  isDeleting.value = true
  try {
    await store.deleteAgent(businessId.value)
    toast.success("Agent deleted")
    await router.replace({ name: "RagAgent" })
  } catch (error) {
    toast.error("Delete failed", messageForProblem(error, "Try again."))
  } finally {
    isDeleting.value = false
  }
}

const hasUnsavedChanges = () => Boolean(store.agent) && form.changes.length > 0

onBeforeRouteLeave(
  () =>
    !hasUnsavedChanges() ||
    window.confirm("Leave without saving? Your unsaved changes will be lost.")
)

const warnBeforeUnload = (event: BeforeUnloadEvent) => {
  if (hasUnsavedChanges()) event.preventDefault()
}

onMounted(() => {
  window.addEventListener("beforeunload", warnBeforeUnload)
  void load()
})

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", warnBeforeUnload)
  window.clearInterval(clock)
  if (documentsChanged && businessId.value) {
    void store.loadAgent(businessId.value, { force: true })
  }
})
</script>

<template>
  <div class="grid grid-cols-1 gap-5">
    <CEmptyState
      v-if="store.agentState === 'error'"
      icon="triangle-alert"
      title="Couldn't load the agent"
      description="Check your connection and try again."
    >
      <CAppButton icon="refresh-cw" @click="load">Try again</CAppButton>
    </CEmptyState>

    <CEmptyState
      v-else-if="store.agentState === 'ready' && !agent"
      icon="bot"
      title="No agent to configure"
      description="Create an agent before opening its configuration."
    >
      <CAppButton
        variant="primary"
        icon="circle-plus"
        :to="{ name: 'RagAgentCreate' }"
      >
        Create agent
      </CAppButton>
    </CEmptyState>

    <div
      v-else-if="!agent"
      class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]"
      aria-busy="true"
      aria-label="Loading configuration"
    >
      <div class="grid grid-cols-1 gap-5">
        <CSkeleton class="h-10 w-80 max-w-full" />
        <CSkeleton v-for="n in 3" :key="n" class="h-44 rounded-2xl" />
      </div>
      <CSkeleton class="h-[420px] rounded-2xl" />
    </div>

    <template v-else>
      <header
        class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2.5">
            <h2 class="text-xl font-semibold tracking-tight text-[#15151B]">
              Edit configuration
            </h2>
            <CBadge
              v-if="agent.status === 'live'"
              tone="success"
              icon="activity"
            >
              {{ agent.name }} · Live
            </CBadge>
            <CBadge v-else icon="pause">{{ agent.name }} · Paused</CBadge>
          </div>
          <p class="mt-1 text-[13.5px] text-[#6A6A74]">
            Update the knowledge base, model, system prompt and channels. Saved
            changes apply to new conversations immediately.
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap items-center gap-2.5">
          <CBadge v-if="form.changes.length" tone="warning" dot>
            {{ plural(form.changes.length, "unsaved change") }}
          </CBadge>
          <CAppButton
            :disabled="!form.changes.length || isSaving"
            @click="discard"
          >
            Discard
          </CAppButton>
          <CAppButton
            variant="primary"
            icon="check"
            :loading="isSaving"
            :disabled="!form.changes.length"
            @click="save"
          >
            Save changes
          </CAppButton>
        </div>
      </header>

      <div
        class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]"
      >
        <div class="grid grid-cols-1 gap-5">
          <CAgentIdentitySection
            v-model:name="form.name"
            v-model:description="form.description"
            icon="bot"
          >
            <template #aside>
              <div class="flex shrink-0 items-center gap-2">
                <CBadge v-if="changed('identity')" tone="warning" dot>
                  Changed
                </CBadge>
                <CAppButton
                  size="sm"
                  :icon="agent.status === 'live' ? 'pause' : 'play'"
                  :loading="isChangingStatus"
                  :aria-label="
                    agent.status === 'live' ? 'Pause agent' : 'Resume agent'
                  "
                  @click="toggleStatus"
                >
                  <span class="hidden sm:inline">
                    {{
                      agent.status === "live" ? "Pause agent" : "Resume agent"
                    }}
                  </span>
                </CAppButton>
                <CAppButton
                  size="sm"
                  variant="danger"
                  icon="trash-2"
                  :loading="isDeleting"
                  aria-label="Delete agent"
                  @click="remove"
                >
                  <span class="hidden sm:inline">Delete agent</span>
                </CAppButton>
              </div>
            </template>
          </CAgentIdentitySection>

          <CKnowledgeBaseSection
            icon="database"
            :hint="knowledgeHint"
            :documents="form.documents"
            :accept="ACCEPTED_EXTENSIONS.join(',')"
            :max-file-bytes="form.maxFileBytes"
            @add="addFiles"
            @remove="removeDocument"
          />

          <CLlmModelSection
            v-model:model="form.model"
            v-model:temperature="form.temperature"
            icon="sparkles"
            hint="Switching models doesn't re-index documents"
            :models="store.models"
            :loading="store.configurationState === 'loading'"
          >
            <template v-if="changed('model')" #aside>
              <CBadge tone="warning" dot>Changed</CBadge>
            </template>
            <CRetrievalFields
              v-model:top-k="form.topK"
              v-model:similarity-threshold="form.similarityThreshold"
            />
          </CLlmModelSection>

          <CSystemPromptSection
            v-model="form.systemPrompt"
            icon="message-square-text"
            :tokens="form.promptTokens"
            :limit="PROMPT_TOKEN_LIMIT"
          >
            <template v-if="changed('prompt')" #aside>
              <CBadge tone="warning" dot>Changed</CBadge>
            </template>
            <template #action>
              <button
                v-if="changed('prompt')"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold text-[#5B4BE8] transition hover:text-[#4F3FDC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BE8]/40"
                @click="form.revertPrompt"
              >
                <CIcon name="history" class="h-4 w-4" />
                Restore saved prompt
              </button>
            </template>
          </CSystemPromptSection>
        </div>

        <div class="grid grid-cols-1 gap-5">
          <CChannelsSection
            icon="plug"
            hint="Live channels for this agent"
            :channels="form.channels"
            :available="form.availableChannels"
            @toggle="form.setChannelEnabled"
            @credential="form.setCredential"
            @add="form.addChannel"
          >
            <template v-if="changed('channels')" #aside>
              <CBadge tone="warning" dot>Changed</CBadge>
            </template>
          </CChannelsSection>
          <CChangeHistory :entries="history" :notice="embeddingNotice" />
        </div>
      </div>
    </template>
  </div>
</template>
