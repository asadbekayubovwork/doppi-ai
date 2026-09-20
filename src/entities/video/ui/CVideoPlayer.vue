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
// Reset the error state when a new clip is loaded.
watch(
  () => props.src,
  () => (failed.value = false)
)
</script>

<template>
  <div
    class="relative flex items-center justify-center overflow-hidden bg-black"
    :class="rounded"
    :style="{ backgroundColor: poster }"
  >
    <video
      v-if="!failed"
      :src="src"
      controls
      playsinline
      preload="metadata"
      class="h-full w-full object-contain"
      @error="failed = true"
    />
    <div
      v-else
      class="flex flex-col items-center gap-2 px-6 text-center text-white/90"
    >
      <CIcon name="triangle-alert" class="h-7 w-7" />
      <p class="text-[12.5px]">Videoni yuklab bo'lmadi. Qayta urinib ko'ring.</p>
    </div>
  </div>
</template>
