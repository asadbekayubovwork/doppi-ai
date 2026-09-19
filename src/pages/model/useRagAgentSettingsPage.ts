import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useHead } from "@unhead/vue"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { useRagAgentStore } from "@/entities/rag-agent"
import { messageForProblem, useAuthStore } from "@/features/auth"
import {
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

interface Activity {
  key: string
  icon: string
  title: string
  detail: string
  at: number
}

export const useRagAgentSettingsPage = () => {
  useHead({ title: "Edit RAG agent — Do'ppi AI" })

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
  const now = ref(Date.now())
  const clock = window.setInterval(() => (now.value = Date.now()), 30_000)
  let activitySequence = 0
  let documentsChanged = false

  const plural = (count: number, noun: string) =>
    `${formatCount(count)} ${noun}${count === 1 ? "" : "s"}`

  const ago = (date: string | number) => {
    const age = formatTimeAgo(new Date(date), now.value)
    return age === "now" ? "now" : `${age} ago`
  }

  const changed = (section: SettingsSection) =>
    form.changedSections.has(section)

  const log = (icon: string, title: string, detail = "You") => {
    activity.value.push({
      key: `activity-${++activitySequence}`,
      icon,
      title,
      detail,
      at: Date.now(),
    })
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
    const item = form.documents.find((document) => document.key === key)
    if (!item) return
    if (
      item.documentId &&
      !window.confirm(
        `Remove ${item.name} from the knowledge base? The agent stops using it right away.`
      )
    ) {
      return
    }
    form.removeDocument(key)
    documentsChanged = true
    log("x", `${item.name} removed`)
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
    if (
      !count ||
      !window.confirm(`Discard ${plural(count, "unsaved change")}?`)
    )
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
    )
      return
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

  const hasUnsavedChanges = () =>
    Boolean(store.agent) && form.changes.length > 0
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

  return {
    store,
    form,
    agent,
    isSaving,
    isChangingStatus,
    isDeleting,
    knowledgeHint,
    embeddingNotice,
    history,
    plural,
    changed,
    load,
    addFiles,
    removeDocument,
    save,
    discard,
    toggleStatus,
    remove,
  }
}
