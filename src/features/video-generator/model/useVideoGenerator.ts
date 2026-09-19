import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { useToast } from "@/shared/lib"
import { videoApi } from "../api/videoApi"
import type { VideoJob, VideoJobCreatePayload } from "../api/types"

const ACTIVE = new Set([
  "submitting",
  "submission_unknown",
  "queued",
  "processing",
])

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
    const index = jobs.value.findIndex((job) => job.id === next.id)
    if (index < 0) jobs.value.unshift(next)
    else jobs.value[index] = next
  }

  const load = async () => {
    if (!businessId.value) {
      jobs.value = []
      return
    }
    isLoading.value = true
    try {
      jobs.value = await videoApi.list(businessId.value)
    } catch (error) {
      toast.error(
        "Couldn't load video jobs",
        messageForProblem(error, "Try again in a moment.")
      )
    } finally {
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
    try {
      const job = await videoApi.create(businessId.value, payload, requestKey())
      replaceJob(job)
      form.topic = ""
      form.sourceText = ""
      form.cta = ""
      form.referenceLinks = ""
      toast.success(
        form.previewOnly ? "Preview job queued" : "Video generation queued",
        "Progress appears in the job list below."
      )
    } catch (error) {
      toast.error(
        "Couldn't start video generation",
        messageForProblem(error, "Check the job list before trying again.")
      )
    } finally {
      isCreating.value = false
    }
  }

  const poll = async () => {
    if (!businessId.value || !activeJobs.value.length || pollInFlight.value)
      return
    pollInFlight.value = true
    try {
      const updates = await Promise.all(
        activeJobs.value
          .filter((job) => job.external_job_id)
          .map((job) => videoApi.refresh(businessId.value, job.id))
      )
      updates.forEach(replaceJob)
    } catch {
      // The next interval retries; avoid a repeating toast while the upstream recovers.
    } finally {
      pollInFlight.value = false
    }
  }

  const sync = async () => {
    if (!businessId.value || isSyncing.value) return
    isSyncing.value = true
    try {
      const result = await videoApi.sync(businessId.value)
      await load()
      toast.success("Video jobs synchronized", `${result.updated} job updated.`)
    } catch (error) {
      toast.error(
        "Couldn't synchronize jobs",
        messageForProblem(error, "Try again in a moment.")
      )
    } finally {
      isSyncing.value = false
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
  onBeforeUnmount(() => window.clearInterval(timer))
  watch(businessId, () => void load())

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
