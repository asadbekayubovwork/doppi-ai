import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from "vue"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { useBillingStore } from "@/features/billing"
import { useToast } from "@/shared/lib"
import { resolveMediaUrl, videoApi } from "../api/videoApi"
import type {
  VideoJob,
  VideoJobCreatePayload,
  VideoLanguage,
} from "../api/types"
import { useVideoModelCatalog } from "./useVideoModelCatalog"
import { useVideoHistory } from "./useVideoHistory"
import {
  ACTIVE_VIDEO_STATUSES,
  optionalVideoText,
  secureReferenceUrls,
  videoRequestKey,
} from "./videoGeneratorUtils"

export const useVideoGenerator = () => {
  const auth = useAuthStore()
  const billing = useBillingStore()
  const toast = useToast()
  const isCreating = ref(false)
  const pollInFlight = ref(false)
  const businessId = computed(() => auth.activeBusiness?.id ?? "")
  const defaultLanguage = (): VideoLanguage => {
    const language = auth.activeBusiness?.default_language
    return language === "ru" || language === "en" ? language : "uz"
  }
  let disposed = false
  let generation = 0
  const attempts = new Map<string, { signature: string; key: string }>()
  const isCurrent = (workspace: string, epoch: number) =>
    !disposed && workspace === businessId.value && epoch === generation
  const history = useVideoHistory(businessId, () => generation, isCurrent)
  const {
    jobs,
    isLoading,
    isSyncing,
    load,
    sync,
    reset: resetHistory,
    download,
  } = history
  const form = reactive({
    topic: "",
    tone: "",
    sourceText: "",
    cta: "",
    referenceLinks: "",
    referenceImages: "",
    durationSec: 15,
    videoModel: "",
    videoResolution: "",
    aspectRatio: "9:16" as "9:16" | "16:9" | "1:1",
    subtitles: true,
    previewOnly: false,
    skipResearch: false,
    researchMode: "fast" as "fast" | "deep",
    language: defaultLanguage(),
  })
  const {
    modelCatalog,
    modelError,
    isLoadingModels,
    selectedModel,
    load: loadModels,
    reset: resetModels,
    invalidate: invalidateModels,
  } = useVideoModelCatalog(businessId, form, () => generation, isCurrent)

  const activeJobs = computed(() =>
    jobs.value.filter((job) => ACTIVE_VIDEO_STATUSES.has(job.status))
  )
  // Only a job created in this session drives the studio result panel, so a
  // reload starts on a clean composer instead of surfacing an old failed job.
  const sessionJobId = ref<string | null>(null)
  const sessionJob = computed<VideoJob | null>(
    () => jobs.value.find((job) => job.id === sessionJobId.value) ?? null
  )
  // The newest job overall; used for polling bookkeeping, not the studio panel.
  const latestJob = computed<VideoJob | null>(() => jobs.value[0] ?? null)
  // 0–100 progress for the session job, from the pipeline's `progress_pct`.
  const progressPct = computed(() => {
    const value = sessionJob.value?.detail?.progress_pct
    return typeof value === "number" && value >= 0 && value <= 100
      ? Math.round(value)
      : null
  })
  const canCreate = computed(() =>
    Boolean(
      businessId.value &&
        form.topic.trim() &&
        selectedModel.value?.resolutions.includes(form.videoResolution)
    )
  )

  // Only the control-plane URL is used by the browser. The provider result_url
  // may be temporary, cross-origin, or require credentials unavailable to the
  // browser, so it remains a diagnostic field rather than a playback source.
  const playbackUrl = (job: VideoJob) =>
    job.status === "completed"
      ? resolveMediaUrl(
          job.stream_url,
          videoApi.streamUrl(businessId.value, job.id)
        )
      : null

  const replaceJob = (next: VideoJob) => {
    if (next.business_id !== businessId.value) return
    const index = jobs.value.findIndex((job) => job.id === next.id)
    if (index < 0) {
      jobs.value.unshift(next)
      return
    }
    // A job that was active and has now settled tells the user its outcome,
    // even if they navigated away from the composer.
    const previous = jobs.value[index]
    jobs.value[index] = next
    if (
      previous.status !== next.status &&
      !ACTIVE_VIDEO_STATUSES.has(next.status)
    ) {
      void billing.load(businessId.value)
    }
    if (
      previous.status !== next.status &&
      ACTIVE_VIDEO_STATUSES.has(previous.status)
    ) {
      if (next.status === "completed") {
        toast.success("Video tayyor", "Uni ko'rish va joylash mumkin.")
      } else if (next.status === "failed") {
        toast.error(
          "Video yaratilmadi",
          next.error_message || "Qayta urinib ko'ring."
        )
      }
    }
  }

  const create = async (publishTo: string[] = []) => {
    if (!canCreate.value || isCreating.value) return
    let links: string[]
    let images: string[]
    try {
      links = secureReferenceUrls(form.referenceLinks)
      images = secureReferenceUrls(form.referenceImages)
    } catch (error) {
      toast.warning("Check reference links", (error as Error).message)
      return
    }
    const targets = publishTo.filter(Boolean)
    const payload: VideoJobCreatePayload = {
      brief: {
        topic: form.topic.trim(),
        duration_sec: form.durationSec,
        language: form.language,
        aspect_ratio: form.aspectRatio,
        video_provider: modelCatalog.value?.provider,
        video_model: form.videoModel,
        video_resolution: form.videoResolution,
        subtitles: form.subtitles,
        preview_only: form.previewOnly,
        // Research mode is only meaningful when research runs at all.
        skip_research: form.skipResearch || undefined,
        research_mode: form.skipResearch ? undefined : form.researchMode,
        tone: optionalVideoText(form.tone),
        source_text: optionalVideoText(form.sourceText),
        cta: optionalVideoText(form.cta),
        reference_links: links.length ? links : undefined,
        reference_image_urls: images.length ? images : undefined,
      },
      ...(targets.length ? { publish_to: targets } : {}),
    }
    isCreating.value = true
    const workspace = businessId.value
    const epoch = generation
    const signature = JSON.stringify(payload)
    let attempt = attempts.get(workspace)
    if (!attempt || attempt.signature !== signature) {
      attempt = { signature, key: videoRequestKey() }
      attempts.set(workspace, attempt)
    }
    try {
      const job = await videoApi.create(workspace, payload, attempt.key)
      if (!isCurrent(workspace, epoch)) return
      replaceJob(job)
      void billing.load(workspace)
      // This is the job the studio result panel should now track.
      sessionJobId.value = job.id
      if (job.status === "submission_unknown" || job.status === "submitting") {
        toast.warning(
          "Submission needs verification",
          job.error_message ||
            "Check this job before generating again. No automatic resubmission will be made."
        )
        return
      }
      if (job.status === "submission_failed" || job.status === "failed") {
        attempts.delete(workspace)
        toast.error(
          "Generation was not completed",
          job.error_message || "Check the job details."
        )
        return
      }
      attempts.delete(workspace)
      form.topic = ""
      form.tone = ""
      form.sourceText = ""
      form.cta = ""
      form.referenceLinks = ""
      form.referenceImages = ""
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

  let timer: number | undefined
  onMounted(() => {
    void load()
    void sync(undefined, { silent: true })
    void loadModels()
    timer = window.setInterval(() => void poll(), 5_000)
  })
  onBeforeUnmount(() => {
    disposed = true
    invalidateModels()
    window.clearInterval(timer)
  })
  watch(businessId, () => {
    generation++
    form.language = defaultLanguage()
    resetModels()
    resetHistory()
    sessionJobId.value = null
    isCreating.value = false
    pollInFlight.value = false
    void load()
    void sync(undefined, { silent: true })
    void loadModels()
  })

  // Clears the studio result panel back to its idle state (e.g. on retry).
  const dismissSessionJob = () => {
    sessionJobId.value = null
  }

  return {
    jobs,
    form,
    modelCatalog,
    selectedModel,
    modelError,
    isLoadingModels,
    activeJobs,
    latestJob,
    sessionJob,
    progressPct,
    dismissSessionJob,
    canCreate,
    isLoading,
    isCreating,
    isSyncing,
    load,
    loadModels,
    create,
    sync,
    download,
    playbackUrl,
  }
}
