<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from "vue"
import CVideoThumb from "./CVideoThumb.vue"

const props = defineProps<{ src: string; color?: string }>()
const container = ref<HTMLElement | null>(null)
const visible = ref(false)
const ready = ref(false)
const failed = ref(false)
let observer: IntersectionObserver | null = null

watch(
  () => props.src,
  () => {
    ready.value = false
    failed.value = false
  }
)

onMounted(() => {
  if (typeof IntersectionObserver !== "function") {
    visible.value = true
    return
  }
  observer = new IntersectionObserver((entries) => {
    if (entries.some((entry) => entry.isIntersecting)) {
      visible.value = true
      observer?.disconnect()
      observer = null
    }
  })
  if (container.value) observer.observe(container.value)
})

onBeforeUnmount(() => observer?.disconnect())

const seekToFrame = (event: Event) => {
  const video = event.currentTarget as HTMLVideoElement
  const time = Number.isFinite(video.duration)
    ? Math.min(0.5, video.duration / 2)
    : 0.5
  try {
    video.currentTime = time
  } catch {
    // Keep the placeholder when this browser cannot seek the file.
    failed.value = true
  }
}
</script>

<template>
  <div ref="container" class="h-11 w-11 shrink-0">
    <CVideoThumb
      :color="color || '#E8E6E2'"
      rounded="rounded-lg"
      class="h-full w-full"
    >
      <video
        v-if="visible && !failed"
        :src="src"
        muted
        playsinline
        preload="metadata"
        aria-hidden="true"
        tabindex="-1"
        class="absolute inset-0 h-full w-full object-cover transition-opacity duration-200"
        :class="ready ? 'opacity-100' : 'opacity-0'"
        @loadedmetadata="seekToFrame"
        @seeked="ready = true"
        @error="failed = true"
      />
    </CVideoThumb>
  </div>
</template>
