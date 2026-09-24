import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import { onBeforeRouteLeave, useRouter } from "vue-router"
import { useRagAgentStore } from "@/entities/rag-agent"
import { messageForProblem, useAuthStore } from "@/features/auth"
import {
  useAgentSettingsForm,
  type ChangeHistoryEntry,
  type SettingsSection,
} from "@/features/rag-agent-setup"
import {
  formatTimeAgo,
  useCountLabel,
  usePageHeading,
  useToast,
} from "@/shared/lib"

interface Activity {
  key: string
  icon: string
  /** i18n key and values of the entry's title. */
  title: string
  params?: Record<string, string>
  /** i18n keys joined into the detail line; "You" when absent. */
  details?: string[]
  at: number
}

export const useRagAgentSettingsPage = () => {
  const { t, locale } = useI18n()
  const count = useCountLabel()
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

  const plural = (noun: string, value: number) =>
    count(`dashboard.plural.${noun}`, value)

  const ago = (date: string | number) => {
    const at = new Date(date).getTime()
    if (now.value - at < 60_000) return t("dashboard.common.justNow")
    return t("dashboard.common.ago", {
      age: formatTimeAgo(new Date(at), now.value, locale.value),
    })
  }

  const labels = (keys: string[]) => keys.map((key) => t(key)).join(", ")

  const changed = (section: SettingsSection) =>
    form.changedSections.has(section)

  const log = (
    icon: string,
    title: string,
    params?: Record<string, string>,
    details?: string[]
  ) => {
    activity.value.push({
      key: `activity-${++activitySequence}`,
      icon,
      title,
      params,
      details,
      at: Date.now(),
    })
  }

  const loadDocuments = async () => {
    try {
      await form.loadDocuments()
    } catch (error) {
      toast.error(
        t("dashboard.rag.knowledge.loadFailed"),
        messageForProblem(error, t("dashboard.common.tryLater"))
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
        t("dashboard.rag.loadConfigFailed"),
        messageForProblem(error, t("dashboard.common.tryLater"))
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
    const key = form.changes.length ? "subtitleDraft" : "subtitle"
    return {
      subtitle: t(`dashboard.rag.settings.${key}`, { name: agent.value.name }),
    }
  })

  const knowledgeHint = computed(() => {
    const chunks = form.documents.reduce(
      (sum, item) =>
        sum + (item.status === "indexed" ? (item.chunkCount ?? 0) : 0),
      0
    )
    return t("dashboard.rag.settings.knowledgeHint", {
      documents: plural("documents", form.documents.length),
      chunks: plural("chunks", chunks),
    })
  })

  const embeddingNotice = computed(() => {
    const inStatus = (status: string) =>
      form.documents.filter((item) => item.status === status).length
    const embedding = inStatus("embedding")
    if (!embedding) return null
    return t("dashboard.rag.settings.embeddingNotice", {
      embedding: plural("documents", embedding),
      indexed: plural("indexedDocuments", inStatus("indexed")),
    })
  })

  const history = computed<ChangeHistoryEntry[]>(() => {
    const entries: ChangeHistoryEntry[] = []
    if (form.changes.length) {
      entries.push({
        key: "draft",
        icon: "circle-dot",
        tone: "warning",
        title: t("dashboard.rag.settings.history.draft"),
        detail: labels(form.changes.map((item) => item.label)),
        time: t("dashboard.common.justNow"),
      })
    }
    for (const item of activity.value.slice(-4).reverse()) {
      entries.push({
        key: item.key,
        icon: item.icon,
        tone: "accent",
        title: t(item.title, item.params ?? {}),
        detail: item.details
          ? labels(item.details)
          : t("dashboard.rag.settings.you"),
        time: ago(item.at),
      })
    }
    if (agent.value) {
      entries.push({
        key: "live",
        icon: "history",
        tone: "neutral",
        title: t("dashboard.rag.settings.history.live"),
        detail: t("dashboard.rag.settings.history.liveDetail"),
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
      log("upload", "dashboard.rag.settings.fileAdded", { name: file.name })
    }
    if (!rejected.length) return
    toast.warning(
      plural("filesSkipped", rejected.length),
      rejected
        .map(({ file, reason }) =>
          t("dashboard.rag.fileSkipped", { name: file.name, reason: t(reason) })
        )
        .join("\n")
    )
  }

  const removeDocument = (key: string) => {
    const item = form.documents.find((document) => document.key === key)
    if (!item) return
    if (
      item.documentId &&
      !window.confirm(
        t("dashboard.rag.settings.removeConfirm", { name: item.name })
      )
    ) {
      return
    }
    form.removeDocument(key)
    documentsChanged = true
    log("x", "dashboard.rag.settings.fileRemoved", { name: item.name })
  }

  const save = async () => {
    if (!form.changes.length) return
    if (form.problems.length) {
      toast.warning(
        t("dashboard.rag.settings.fixFirst"),
        labels(form.problems)
      )
      return
    }
    const changedLabels = form.changes.map((item) => item.label)
    isSaving.value = true
    try {
      await store.saveConfiguration(businessId.value, form.toUpdate())
      if (store.agent) form.reset(store.agent)
      log("check", "dashboard.rag.settings.saved", undefined, changedLabels)
      toast.success(
        t("dashboard.rag.settings.changesSaved"),
        t("dashboard.rag.settings.changesSavedDetail")
      )
    } catch (error) {
      if (store.agent) form.rebase(store.agent)
      toast.error(
        t("dashboard.rag.settings.saveFailed"),
        messageForProblem(error, t("dashboard.common.tryLater"))
      )
    } finally {
      isSaving.value = false
    }
  }

  const discard = () => {
    const changes = form.changes.length
    if (
      !changes ||
      !window.confirm(
        t("dashboard.rag.settings.discardConfirm", {
          changes: plural("unsavedChanges", changes),
        })
      )
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
      const title = `dashboard.rag.settings.${next === "live" ? "resumed" : "paused"}`
      log(next === "live" ? "play" : "pause", title)
      toast.success(t(title), t(`${title}Detail`))
    } catch (error) {
      toast.error(
        t("dashboard.rag.settings.statusFailed"),
        messageForProblem(error, t("dashboard.common.tryLater"))
      )
    } finally {
      isChangingStatus.value = false
    }
  }

  const remove = async () => {
    if (
      !window.confirm(t("dashboard.rag.settings.deleteConfirm"))
    )
      return
    isDeleting.value = true
    try {
      await store.deleteAgent(businessId.value)
      toast.success(t("dashboard.rag.settings.deleted"))
      await router.replace({ name: "RagAgent" })
    } catch (error) {
      toast.error(
        t("dashboard.rag.settings.deleteFailed"),
        messageForProblem(error, t("dashboard.common.retry"))
      )
    } finally {
      isDeleting.value = false
    }
  }

  const hasUnsavedChanges = () =>
    Boolean(store.agent) && form.changes.length > 0
  onBeforeRouteLeave(
    () =>
      !hasUnsavedChanges() ||
      window.confirm(t("dashboard.rag.settings.leaveConfirm"))
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
