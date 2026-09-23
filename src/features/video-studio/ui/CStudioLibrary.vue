<script setup lang="ts">
import { computed, ref } from "vue"
import { CVideoThumb, type StudioVideo } from "@/entities/video"
import { CBadge, CEmptyState, CIcon, CSkeleton } from "@/shared/ui"
import type { StudioVideoStatus } from "@/entities/video"

const props = defineProps<{ videos: StudioVideo[]; loading?: boolean }>()
defineEmits<{ preview: [video: StudioVideo] }>()

type Filter = "all" | "ready" | "processing" | "issues"
const filter = ref<Filter>("all")
const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "all", label: "Barchasi" },
  { value: "ready", label: "Tayyor" },
  { value: "processing", label: "Jarayonda" },
  { value: "issues", label: "Muammo" },
]

const STATUS: Record<
  StudioVideoStatus,
  {
    label: string
    tone: "success" | "accent" | "danger" | "warning" | "neutral"
  }
> = {
  ready: { label: "Tayyor", tone: "success" },
  processing: { label: "Jarayonda", tone: "accent" },
  failed: { label: "Xato", tone: "danger" },
  review: { label: "Tekshirish kerak", tone: "warning" },
  published: { label: "Joylangan", tone: "success" },
  draft: { label: "Draft", tone: "neutral" },
}

const visible = computed(() =>
  filter.value === "all"
    ? props.videos
    : filter.value === "issues"
      ? props.videos.filter((video) =>
          ["failed", "review"].includes(video.status)
        )
      : filter.value === "ready"
        ? props.videos.filter((video) =>
            ["ready", "published"].includes(video.status)
          )
        : props.videos.filter((video) =>
            ["processing", "draft"].includes(video.status)
          )
)
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header class="border-b border-[#ECECE8] px-5 py-4">
      <div class="flex items-center justify-between">
        <h2 class="text-[15px] font-semibold text-[#15151B]">
          Mening videolarim
        </h2>
        <span class="text-[12px] text-[#9A9AA2]">{{ videos.length }} ta</span>
      </div>
      <div
        class="mt-3 inline-flex w-full items-center gap-0.5 rounded-[10px] border border-[#E7E5F3] bg-[#F5F4FB] p-0.5"
        role="tablist"
      >
        <button
          v-for="tab in FILTERS"
          :key="tab.value"
          type="button"
          role="tab"
          :aria-selected="filter === tab.value"
          class="min-h-11 flex-1 rounded-[8px] text-[12px] font-semibold transition"
          :class="
            filter === tab.value
              ? 'bg-white text-[#15151B] shadow-[0_1px_2px_rgba(22,22,27,0.08)]'
              : 'text-[#73737D] hover:text-[#15151B]'
          "
          @click="filter = tab.value"
        >
          {{ tab.label }}
        </button>
      </div>
    </header>

    <ul
      v-if="!loading && visible.length"
      class="flex-1 divide-y divide-[#F1F1EE] overflow-y-auto"
    >
      <li
        v-for="video in visible"
        :key="video.id"
        class="flex items-center gap-3 px-4 py-3 transition hover:bg-[#FCFCFA]"
      >
        <CVideoThumb
          :color="video.thumbnail"
          rounded="rounded-lg"
          class="h-11 w-11 shrink-0"
        />
        <div class="min-w-0 flex-1">
          <p class="truncate text-[13px] font-semibold text-[#24242A]">
            {{ video.title }}
          </p>
          <div class="mt-0.5 flex items-center gap-2">
            <span class="truncate text-[11.5px] text-[#9A9AA2]">
              {{ video.meta }}
            </span>
            <CBadge :tone="STATUS[video.status].tone" size="sm">
              {{ STATUS[video.status].label }}
            </CBadge>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-0.5">
          <button
            v-if="video.previewUrl"
            type="button"
            aria-label="Videoni ko'rish"
            class="grid h-11 w-11 place-items-center rounded-lg text-[#73737D] transition hover:bg-[#F5F4FB] hover:text-[#5B4BE8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8175EA]"
            @click="$emit('preview', video)"
          >
            <CIcon name="external-link" class="h-4 w-4" />
          </button>
          <a
            v-if="video.downloadUrl"
            :href="video.downloadUrl"
            aria-label="Videoni yuklab olish"
            class="grid h-11 w-11 place-items-center rounded-lg text-[#73737D] transition hover:bg-[#F5F4FB] hover:text-[#5B4BE8] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8175EA]"
          >
            <CIcon name="download" class="h-4 w-4" />
          </a>
        </div>
      </li>
    </ul>

    <div v-else-if="loading" class="grid gap-3 p-4" role="status">
      <CSkeleton v-for="index in 3" :key="index" class="h-14 rounded-lg" />
    </div>
    <CEmptyState
      v-else-if="!visible.length"
      class="m-4"
      icon="clapperboard"
      :title="
        filter === 'all' ? 'Hali video yo‘q' : 'Bu holatda video topilmadi'
      "
      description="Yaratilgan videolar shu yerda statusi va xavfsiz ko'rish/yuklab olish havolalari bilan chiqadi."
    />

    <footer
      class="flex items-start gap-2 border-t border-[#ECECE8] px-4 py-3 text-[11.5px] leading-4 text-[#9A9AA2]"
    >
      <CIcon name="info" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
      O'zingiz yaratgan videolar plan statistikasiga ta'sir qilmaydi.
    </footer>
  </section>
</template>
