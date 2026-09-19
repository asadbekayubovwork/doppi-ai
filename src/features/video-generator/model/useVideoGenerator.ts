import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { useToast } from "@/shared/lib"
import { videoApi } from "../api/videoApi"
import type { VideoJob, VideoJobCreatePayload } from "../api/types"

const ACTIVE = new Set(["submitting", "queued", "processing"])

const requestKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}-video`
}

const secureUrls = (raw: string) => {
  const values = raw
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
  for (const value of values) {
    const parsed = new URL(value)
    if (parsed.protocol !== "https:")
      throw new Error("Only HTTPS reference URLs are accepted.")
  }
  return values
}

export const useVideoGenerator = () => {
  const auth = useAuthStore()
  const toast = useToast()
  const jobs = ref<VideoJob[]>([])
  const isLoading = ref(false)
  const isCreating = ref(false)
  const isSyncing = ref(false)
  const pollInFlight = ref(false)
  const businessId = computed(() => auth.activeBusiness?.id ?? "")
  let disposed = false
  let generation = 0
  let loadSequence = 0
  const attempts = new Map<string, { signature: string; key: string }>()
  const isCurrent = (workspace: string, epoch: number) =>
    !disposed && workspace === businessId.value && epoch === generation
  const form = reactive({
    topic: "",
    sourceText: "",
    cta: "",
    referenceLinks: "",
    durationSec: 15,
    aspectRatio: "9:16" as "9:16" | "16:9" | "1:1",
    subtitles: true,
    previewOnly: false,
    researchMode: "fast" as "fast" | "deep",
  })

  const activeJobs = computed(() =>
    jobs.value.filter((job) => ACTIVE.has(job.status))
  )
  const canCreate = computed(() =>
    Boolean(businessId.value && form.topic.trim())
  )

  const replaceJob = (next: VideoJob) => {
    if (next.business_id !== businessId.value) return
    const index = jobs.value.findIndex((job) => job.id === next.id)
    if (index < 0) jobs.value.unshift(next)
    else jobs.value[index] = next
  }

  const load = async () => {
    const workspace = businessId.value
    const epoch = generation
    const sequence = ++loadSequence
    if (!businessId.value) {
      jobs.value = []
      isLoading.value = false
      return
    }
    isLoading.value = true
    try {
      const result = await videoApi.list(workspace)
      if (isCurrent(workspace, epoch) && sequence === loadSequence)
        jobs.value = result
    } catch (error) {
      if (!isCurrent(workspace, epoch)) return
      toast.error(
        "Couldn't load video jobs",
        messageForProblem(error, "Try again in a moment.")
      )
    } finally {
      if (isCurrent(workspace, epoch) && sequence === loadSequence)
        isLoading.value = false
    }
  }

  const create = async () => {
    if (!canCreate.value || isCreating.value) return
    const confirmation = form.previewOnly
      ? "Start prompt preview? This sends one request to the video service without rendering clips."
      : "Start full video generation? This sends one paid generation request to the video service."
    if (!window.confirm(confirmation)) {
      return
    }
    let links: string[]
    try {
      links = secureUrls(form.referenceLinks)
    } catch (error) {
      toast.warning("Check reference links", (error as Error).message)
      return
    }
    const payload: VideoJobCreatePayload = {
      brief: {
        topic: form.topic.trim(),
        duration_sec: form.durationSec,
        language: auth.activeBusiness?.default_language || "uz",
        aspect_ratio: form.aspectRatio,
        subtitles: form.subtitles,
        preview_only: form.previewOnly,
        research_mode: form.researchMode,
        source_text: form.sourceText.trim() || undefined,
        cta: form.cta.trim() || undefined,
        reference_links: links.length ? links : undefined,
      },
    }
    isCreating.value = true
    const workspace = businessId.value
    const epoch = generation
    const signature = JSON.stringify(payload)
    let attempt = attempts.get(workspace)
    if (!attempt || attempt.signature !== signature) {
      attempt = { signature, key: requestKey() }
      attempts.set(workspace, attempt)
    }
    try {
      const job = await videoApi.create(workspace, payload, attempt.key)
      if (!isCurrent(workspace, epoch)) return
      replaceJob(job)
      if (job.status === "submission_unknown" || job.status === "submitting") {
        toast.warning(
          "Submission needs verification",
          job.error_message ||
            "Check this job before generating again. No automatic resubmission will be made."
        )
        return
      }
      if (job.status === "submission_failed" || job.status === "failed") {
        toast.error(
          "Generation was not completed",
          job.error_message || "Check the job details."
        )
        return
      }
      attempts.delete(workspace)
      form.topic = ""
      form.sourceText = ""
      form.cta = ""
      form.referenceLinks = ""
      toast.success(
        form.previewOnly ? "Preview job queued" : "Video generation queued",
        "Progress appears in the job list below."
      )
    } catch (error) {
      if (!isCurrent(workspace, epoch)) return
      toast.error(
        "Couldn't start video generation",
        messageForProblem(error, "Check the job list before trying again.")
      )
      await load()
    } finally {
      if (isCurrent(workspace, epoch)) isCreating.value = false
    }
  }

  const poll = async () => {
    if (!businessId.value || !activeJobs.value.length || pollInFlight.value)
      return
    pollInFlight.value = true
    const workspace = businessId.value
    const epoch = generation
    try {
      const updates = await Promise.allSettled(
        activeJobs.value.map((job) =>
          job.external_job_id
            ? videoApi.refresh(workspace, job.id)
            : videoApi.get(workspace, job.id)
        )
      )
      if (!isCurrent(workspace, epoch)) return
      for (const update of updates) {
        if (update.status === "fulfilled") replaceJob(update.value)
      }
    } finally {
      if (isCurrent(workspace, epoch)) pollInFlight.value = false
    }
  }

  const sync = async () => {
    if (!businessId.value || isSyncing.value) return
    isSyncing.value = true
    const workspace = businessId.value
    const epoch = generation
    try {
      const result = await videoApi.sync(workspace)
      if (!isCurrent(workspace, epoch)) return
      await load()
      if (!isCurrent(workspace, epoch)) return
      toast.success("Video jobs synchronized", `${result.updated} job updated.`)
    } catch (error) {
      if (!isCurrent(workspace, epoch)) return
      toast.error(
        "Couldn't synchronize jobs",
        messageForProblem(error, "Try again in a moment.")
      )
    } finally {
      if (isCurrent(workspace, epoch)) isSyncing.value = false
    }
  }

  const download = (job: VideoJob) => {
    if (!businessId.value || job.status !== "completed") return
    window.location.assign(videoApi.downloadUrl(businessId.value, job.id))
  }

  let timer: number | undefined
  onMounted(() => {
    void load()
    timer = window.setInterval(() => void poll(), 5_000)
  })
  onBeforeUnmount(() => {
    disposed = true
    window.clearInterval(timer)
  })
  watch(businessId, () => {
    generation++
    jobs.value = []
    isCreating.value = false
    isSyncing.value = false
    pollInFlight.value = false
    void load()
  })

  return {
    jobs,
    form,
    activeJobs,
    canCreate,
    isLoading,
    isCreating,
    isSyncing,
    load,
    create,
    sync,
    download,
  }
}
