<script setup lang="ts">
import { computed, ref } from "vue"
import { useHead } from "@unhead/vue"
import { usePageHeading } from "@/shared/lib"
import { useVideoGenerator } from "@/features/video-generator"
import {
  CPublishModal,
  CStudioComposer,
  CStudioLibrary,
  CStudioResult,
} from "@/features/video-studio"
import { STUDIO_VIDEOS } from "@/entities/video"
import { CAppButton } from "@/shared/ui"

useHead({ title: "Yangi video — Do'ppi AI" })
usePageHeading(() => ({
  subtitle: "Navbatdan tashqari video · o'z prompt va kontekstingiz bilan",
}))

const {
  form,
  canCreate,
  isCreating,
  create,
  download,
  latestJob,
  progressPct,
  playbackUrl,
} = useVideoGenerator()

// Playback URL for the newest job once it completes; drives the <video> player
// and enables the publish/download actions. Survives a page refresh because the
// composable reloads the job list on mount and keeps polling active jobs.
const currentPlaybackUrl = computed(() =>
  latestJob.value ? playbackUrl(latestJob.value) : null
)

const publishOpen = ref(false)
const onDownload = () => {
  if (latestJob.value?.status === "completed") download(latestJob.value)
}

// The publish modal returns the platforms the user kept enabled; they ride
// along in the create payload's publish_to array.
const onPublish = (targets: string[]) => {
  publishOpen.value = false
  void create(targets)
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
          Plandan tashqari: kontekst, prompt va rasmlar bilan o'zingiz boshqarasiz
        </p>
      </div>
      <div class="flex items-center gap-2.5">
        <span
          class="inline-flex h-9 items-center gap-2 rounded-[10px] border border-[#E5E5E1] bg-white px-3.5 text-[13px] font-semibold text-[#42424B]"
        >
          1,860 kredit
        </span>
        <CAppButton icon="history">Barcha videolarim</CAppButton>
      </div>
    </div>

    <div
      class="grid items-start gap-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)_360px]"
    >
      <CStudioComposer
        v-model:prompt="form.topic"
        v-model:aspect-ratio="form.aspectRatio"
        v-model:duration-sec="form.durationSec"
        v-model:research-mode="form.researchMode"
        v-model:skip-research="form.skipResearch"
        v-model:subtitles="form.subtitles"
        v-model:preview-only="form.previewOnly"
        v-model:tone="form.tone"
        v-model:cta="form.cta"
        v-model:source-text="form.sourceText"
        v-model:reference-links="form.referenceLinks"
        v-model:reference-images="form.referenceImages"
        :is-creating="isCreating"
        :can-create="canCreate"
        @submit="create()"
      />
      <CStudioResult
        :job="latestJob"
        :playback-url="currentPlaybackUrl"
        :progress="progressPct"
        :is-submitting="isCreating"
        @publish="publishOpen = true"
        @download="onDownload"
        @regenerate="create()"
      />
      <CStudioLibrary :videos="STUDIO_VIDEOS" />
    </div>

    <CPublishModal v-model:open="publishOpen" @publish="onPublish" />
  </div>
</template>
