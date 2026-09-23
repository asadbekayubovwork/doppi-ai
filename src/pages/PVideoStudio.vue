<script setup lang="ts">
import { computed, ref } from "vue"
import { useHead } from "@unhead/vue"
import { usePageHeading } from "@/shared/lib"
import {
  CVideoJobs,
  CVideoPreviewDialog,
  resolveMediaUrl,
  useVideoGenerator,
  videoApi,
  type VideoJob,
} from "@/features/video-generator"
import {
  CPublishModal,
  CStudioComposer,
  CStudioLibrary,
  CStudioResult,
} from "@/features/video-studio"
import type { StudioVideo } from "@/entities/video"
import { CAppButton } from "@/shared/ui"

useHead({ title: "Yangi video — Do'ppi AI" })
usePageHeading(() => ({
  subtitle: "Navbatdan tashqari video · o'z prompt va kontekstingiz bilan",
}))

const {
  form,
  modelCatalog,
  isLoadingModels,
  modelError,
  canCreate,
  isCreating,
  jobs,
  isLoading,
  isSyncing,
  create,
  download,
  sync,
  sessionJob,
  progressPct,
  playbackUrl,
  dismissSessionJob,
  loadModels,
} = useVideoGenerator()

const libraryVideos = computed<StudioVideo[]>(() =>
  jobs.value.slice(0, 8).map((job) => {
    const status: StudioVideo["status"] =
      job.status === "completed"
        ? "ready"
        : job.status === "failed" || job.status === "submission_failed"
          ? "failed"
          : job.status === "submission_unknown"
            ? "review"
            : "processing"
    const ready = status === "ready"
    return {
      id: job.id,
      title: job.brief.topic || "Video",
      meta: `${job.brief.duration_sec ?? "—"}s · ${new Intl.DateTimeFormat(
        "uz-UZ",
        {
          day: "numeric",
          month: "short",
        }
      ).format(new Date(job.created_at))}`,
      status,
      thumbnail: "#E8E6E2",
      previewUrl: ready
        ? resolveMediaUrl(
            job.stream_url,
            videoApi.streamUrl(job.business_id, job.id)
          )
        : undefined,
      downloadUrl: ready
        ? resolveMediaUrl(
            job.download_url,
            videoApi.downloadUrl(job.business_id, job.id)
          )
        : undefined,
    }
  })
)

// The result panel only tracks a job created in this session, so opening the
// page (or reloading it) starts on a clean composer rather than surfacing an
// old failed job.
const currentPlaybackUrl = computed(() =>
  sessionJob.value ? playbackUrl(sessionJob.value) : null
)

const scrollToJobs = () => {
  document.getElementById("plans")?.scrollIntoView({ behavior: "smooth" })
}

const publishOpen = ref(false)
const previewJobId = ref<string | null>(null)
const previewJob = computed(
  () => jobs.value.find((job) => job.id === previewJobId.value) ?? null
)
const onDownload = () => {
  if (sessionJob.value?.status === "completed") download(sessionJob.value)
}

const openPreview = (job: VideoJob) => {
  previewJobId.value = job.id
}

const openLibraryPreview = (video: StudioVideo) => {
  const job = jobs.value.find((item) => item.id === video.id)
  if (job) openPreview(job)
}

// The publish modal returns the platforms the user kept enabled; they ride
// along in the create payload's publish_to array.
const onPublish = (targets: string[]) => {
  publishOpen.value = false
  void create(targets)
}

// "Retry"/"Regenerate": put the failed job's brief back into the form, clear
// the result panel, and let the user adjust and resubmit deliberately.
const onRegenerate = () => {
  const brief = sessionJob.value?.brief
  if (brief) {
    form.topic = brief.topic ?? form.topic
    form.tone = brief.tone ?? ""
    form.cta = brief.cta ?? ""
    form.sourceText = brief.source_text ?? ""
    form.durationSec = brief.duration_sec ?? form.durationSec
    if (brief.aspect_ratio) form.aspectRatio = brief.aspect_ratio
    form.subtitles = brief.subtitles ?? form.subtitles
    form.researchMode = brief.research_mode ?? form.researchMode
    form.referenceLinks = (brief.reference_links ?? []).join("\n")
    form.referenceImages = (brief.reference_image_urls ?? []).join("\n")
  }
  dismissSessionJob()
}
</script>

<template>
  <div class="mx-auto grid max-w-[1500px] gap-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[#15151B]">
          Yangi video yaratish
        </h1>
        <p class="mt-1 text-[13.5px] text-[#73737D]">
          Plandan tashqari: kontekst, prompt va rasmlar bilan o'zingiz
          boshqarasiz
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <span
          class="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#E5E5E1] bg-white px-3.5 text-[13px] font-semibold text-[#42424B]"
        >
          1,860 kredit
        </span>
        <CAppButton icon="history" @click="scrollToJobs"
          >Barcha videolarim</CAppButton
        >
      </div>
    </div>

    <div
      class="grid items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_360px]"
    >
      <CStudioComposer
        v-model:prompt="form.topic"
        v-model:aspect-ratio="form.aspectRatio"
        v-model:duration-sec="form.durationSec"
        v-model:video-model="form.videoModel"
        v-model:video-resolution="form.videoResolution"
        v-model:research-mode="form.researchMode"
        v-model:subtitles="form.subtitles"
        v-model:preview-only="form.previewOnly"
        v-model:language="form.language"
        v-model:tone="form.tone"
        v-model:cta="form.cta"
        v-model:source-text="form.sourceText"
        v-model:reference-links="form.referenceLinks"
        v-model:reference-images="form.referenceImages"
        :is-creating="isCreating"
        :can-create="canCreate"
        :models="modelCatalog?.models ?? []"
        :models-loading="isLoadingModels"
        :model-error="modelError"
        @submit="create()"
        @retry-models="loadModels"
      />
      <CStudioResult
        :job="sessionJob"
        :playback-url="currentPlaybackUrl"
        :progress="progressPct"
        :is-submitting="isCreating"
        @publish="publishOpen = true"
        @download="onDownload"
        @regenerate="onRegenerate"
      />
      <CStudioLibrary
        :videos="libraryVideos"
        :loading="isLoading"
        @preview="openLibraryPreview"
      />
    </div>

    <CVideoJobs
      :jobs="jobs"
      :is-loading="isLoading"
      :is-syncing="isSyncing"
      @sync="sync"
      @download="download"
      @preview="openPreview"
    />

    <CVideoPreviewDialog
      :job="previewJob"
      @close="previewJobId = null"
      @download="download"
    />

    <CPublishModal v-model:open="publishOpen" @publish="onPublish" />
  </div>
</template>
