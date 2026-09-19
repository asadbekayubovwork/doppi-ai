<script setup lang="ts">
import { computed } from "vue"
import { useHead } from "@unhead/vue"
import { useAuthStore } from "@/features/auth"
import {
  CVideoComposer,
  CVideoJobs,
  useVideoGenerator,
} from "@/features/video-generator"
import { CBadge } from "@/shared/ui"

useHead({ title: "Video generator — Do'ppi AI" })

const auth = useAuthStore()
const language = computed(() => auth.activeBusiness?.default_language || "uz")
const {
  jobs,
  form,
  canCreate,
  isLoading,
  isCreating,
  isSyncing,
  create,
  sync,
  download,
} = useVideoGenerator()
</script>

<template>
  <div class="grid grid-cols-1 gap-5">
    <header
      class="flex flex-col gap-3 rounded-2xl border border-[#E7E5F3] bg-[radial-gradient(circle_at_85%_20%,rgba(91,75,232,0.12),transparent_34%),linear-gradient(135deg,#fff_0%,#faf9ff_100%)] px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:px-6"
    >
      <div class="max-w-2xl">
        <p
          class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#5B4BE8]"
        >
          OpenMontage pipeline
        </p>
        <h2 class="mt-1 text-xl font-semibold tracking-tight text-[#15151B]">
          Prompt to production-ready video
        </h2>
        <p class="mt-1.5 text-[13.5px] leading-6 text-[#686873]">
          Create a tenant-isolated generation job, follow its multi-agent trail,
          and download the completed file through the secure control plane.
        </p>
      </div>
      <CBadge tone="success" icon="shield-check">Workspace isolated</CBadge>
    </header>

    <div
      class="grid items-start gap-5 2xl:grid-cols-[minmax(0,0.92fr)_minmax(520px,1.08fr)]"
    >
      <CVideoComposer
        v-model:topic="form.topic"
        v-model:source-text="form.sourceText"
        v-model:cta="form.cta"
        v-model:reference-links="form.referenceLinks"
        v-model:duration-sec="form.durationSec"
        v-model:aspect-ratio="form.aspectRatio"
        v-model:subtitles="form.subtitles"
        v-model:preview-only="form.previewOnly"
        v-model:research-mode="form.researchMode"
        :language="language"
        :can-create="canCreate"
        :is-creating="isCreating"
        @submit="create"
      />
      <CVideoJobs
        :jobs="jobs"
        :is-loading="isLoading"
        :is-syncing="isSyncing"
        @sync="sync"
        @download="download"
      />
    </div>
  </div>
</template>
