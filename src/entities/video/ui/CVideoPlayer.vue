<script setup lang="ts">
import { ref, watch } from "vue"
import { CIcon } from "@/shared/ui"

const props = withDefaults(
  defineProps<{
    /** Same-origin URL the browser can stream. */
    src: string
    /** Placeholder colour behind the poster / while loading. */
    poster?: string
    rounded?: string
  }>(),
  { poster: "#15151B", rounded: "rounded-[24px]" }
)

const failed = ref(false)
const loading = ref(true)
const attempt = ref(0)
// Reset the error state when a new clip is loaded.
watch(
  () => props.src,
  () => {
    failed.value = false
    loading.value = true
    attempt.value++
  }
)

const retry = () => {
  failed.value = false
  loading.value = true
  attempt.value++
}

const onError = () => {
  loading.value = false
  failed.value = true
}
</script>

<template>
  <div
    class="relative flex items-center justify-center overflow-hidden bg-black"
    :class="rounded"
    :style="{ backgroundColor: poster }"
  >
    <video
      v-if="!failed"
      :key="attempt"
      :src="src"
      controls
      playsinline
      preload="metadata"
      :aria-label="$t('dashboard.video.studio.player.label')"
      class="h-full w-full object-contain"
      @loadstart="loading = true"
      @loadedmetadata="loading = false"
      @loadeddata="loading = false"
      @canplay="loading = false"
      @error="onError"
    />
    <div
      v-if="loading && !failed"
      role="status"
      aria-live="polite"
      class="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#17171C]/90 text-center text-white"
    >
      <CIcon name="loader-circle" class="h-8 w-8 animate-spin text-[#B7AEFF]" />
      <span class="text-[12.5px] font-medium">
        {{ $t("dashboard.video.studio.player.loading") }}
      </span>
    </div>
    <div
      v-else-if="failed"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[#17171C] px-6 text-center text-white/90"
    >
      <CIcon name="triangle-alert" class="h-7 w-7 text-[#F3C27A]" />
      <p class="max-w-[240px] text-[12.5px] leading-5">
        {{ $t("dashboard.video.studio.player.failed") }}
      </p>
      <button
        type="button"
        class="rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold transition hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        @click="retry"
      >
        {{ $t("dashboard.video.studio.player.reload") }}
      </button>
    </div>
  </div>
</template>
