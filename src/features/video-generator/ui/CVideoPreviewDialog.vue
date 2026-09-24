<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from "vue"
import { CIcon } from "@/shared/ui"
import { CVideoPlayer } from "@/entities/video"
import { resolveMediaUrl, videoApi } from "../api/videoApi"
import type { VideoJob } from "../api/types"

const props = defineProps<{ job: VideoJob | null }>()
const emit = defineEmits<{
  close: []
  download: [job: VideoJob]
}>()

const dialog = ref<HTMLElement | null>(null)
const previousFocus = ref<HTMLElement | null>(null)
let previousOverflow: string | null = null
const restorePage = () => {
  if (previousOverflow !== null) document.body.style.overflow = previousOverflow
  previousOverflow = null
  previousFocus.value?.focus()
  previousFocus.value = null
}
onBeforeUnmount(restorePage)
const streamUrl = computed(() => {
  const job = props.job
  if (!job) return ""
  return resolveMediaUrl(
    job.stream_url,
    videoApi.streamUrl(job.business_id, job.id)
  )
})
const playerStyle = computed(() => {
  const ratio = props.job?.brief.aspect_ratio
  if (ratio === "16:9") {
    return { width: "min(960px, 100%)", aspectRatio: "16 / 9" }
  }
  if (ratio === "1:1") {
    return { width: "min(680px, 72vh)", aspectRatio: "1 / 1" }
  }
  return { width: "min(405px, 40.5vh)", height: "min(720px, 72vh)" }
})

watch(
  () => props.job?.id,
  async (jobId, previousId) => {
    if (jobId) {
      if (!previousId) {
        previousFocus.value = document.activeElement as HTMLElement | null
        previousOverflow = document.body.style.overflow
        document.body.style.overflow = "hidden"
      }
      await nextTick()
      dialog.value?.focus()
    } else if (previousId) {
      await nextTick()
      restorePage()
    }
  },
  { immediate: true }
)

const close = () => emit("close")
const onKeydown = (event: KeyboardEvent) => {
  if (event.key === "Escape") {
    event.preventDefault()
    event.stopPropagation()
    close()
  }
  if (event.key !== "Tab") return
  const elements = dialog.value?.querySelectorAll<HTMLElement>(
    "button:not(:disabled), video[controls], [href]"
  )
  if (!elements?.length) return
  const first = elements[0]
  const last = elements[elements.length - 1]
  if (
    event.shiftKey &&
    [first, dialog.value].includes(document.activeElement as HTMLElement)
  ) {
    event.preventDefault()
    last?.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first?.focus()
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="job"
      ref="dialog"
      role="dialog"
      aria-modal="true"
      aria-labelledby="video-preview-title"
      tabindex="-1"
      class="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#101014]/85 p-4 backdrop-blur-md sm:p-8"
      @click.self="close"
      @keydown="onKeydown"
    >
      <section
        class="relative my-auto w-full max-w-6xl overflow-hidden rounded-[28px] border border-white/10 bg-[#F7F6F2] shadow-[0_32px_100px_rgba(0,0,0,0.45)]"
      >
        <header
          class="flex items-start justify-between gap-4 border-b border-[#E7E4DE] px-5 py-4 sm:px-7"
        >
          <div class="min-w-0">
            <p
              class="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#77727D]"
            >
              {{ $t("dashboard.video.studio.preview.eyebrow") }}
            </p>
            <h2
              id="video-preview-title"
              class="mt-1 truncate text-lg font-semibold tracking-tight text-[#18171D] sm:text-xl"
            >
              {{ job.brief.topic || $t("dashboard.video.studio.preview.untitled") }}
            </h2>
          </div>
          <button
            type="button"
            :aria-label="$t('dashboard.video.studio.preview.close')"
            class="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-[#E2DFD8] bg-white text-[#5F5B64] transition hover:border-[#C9C3D9] hover:text-[#5B4BE8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8175EA]"
            @click="close"
          >
            <CIcon name="x" class="h-4 w-4" />
          </button>
        </header>

        <div
          class="grid items-center gap-5 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_240px] lg:gap-7 lg:p-7"
        >
          <div
            class="flex min-h-[240px] items-center justify-center overflow-hidden rounded-2xl bg-[#17171C] p-3 sm:p-5"
          >
            <CVideoPlayer
              :key="streamUrl"
              :src="streamUrl"
              :style="playerStyle"
              class="max-h-[72vh] max-w-full border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
            />
          </div>

          <aside class="flex flex-col gap-5 lg:py-2">
            <div>
              <p
                class="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#85808A]"
              >
                {{ $t("dashboard.video.studio.preview.details") }}
              </p>
              <dl
                class="mt-3 divide-y divide-[#E7E4DE] rounded-2xl border border-[#E7E4DE] bg-white/80 px-4"
              >
                <div
                  class="flex items-center justify-between gap-3 py-3 text-[13px]"
                >
                  <dt class="text-[#77727D]">{{ $t("dashboard.video.studio.preview.status") }}</dt>
                  <dd class="font-semibold text-[#177A46]">
                    {{ $t("dashboard.video.studio.preview.ready") }}
                  </dd>
                </div>
                <div
                  class="flex items-center justify-between gap-3 py-3 text-[13px]"
                >
                  <dt class="text-[#77727D]">{{ $t("dashboard.video.studio.preview.format") }}</dt>
                  <dd class="font-medium text-[#27252D]">
                    {{ job.brief.aspect_ratio || $t("dashboard.video.studio.preview.auto") }}
                  </dd>
                </div>
                <div
                  class="flex items-center justify-between gap-3 py-3 text-[13px]"
                >
                  <dt class="text-[#77727D]">{{ $t("dashboard.video.studio.preview.duration") }}</dt>
                  <dd class="font-medium text-[#27252D]">
                    {{
                      job.brief.duration_sec
                        ? `${job.brief.duration_sec}s`
                        : "—"
                    }}
                  </dd>
                </div>
                <div
                  v-if="job.brief.video_model"
                  class="flex items-center justify-between gap-3 py-3 text-[13px]"
                >
                  <dt class="text-[#77727D]">{{ $t("dashboard.video.studio.preview.model") }}</dt>
                  <dd class="max-w-[135px] truncate font-medium text-[#27252D]">
                    {{ job.brief.video_model }}
                  </dd>
                </div>
              </dl>
            </div>

            <button
              type="button"
              class="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#5B4BE8] px-4 text-[13px] font-semibold text-white shadow-[0_8px_20px_rgba(91,75,232,0.22)] transition hover:bg-[#4D3ED4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8175EA]"
              @click="emit('download', job)"
            >
              <CIcon name="download" class="h-4 w-4" />
              {{ $t("dashboard.video.studio.preview.download") }}
            </button>
          </aside>
        </div>
      </section>
    </div>
  </Teleport>
</template>
