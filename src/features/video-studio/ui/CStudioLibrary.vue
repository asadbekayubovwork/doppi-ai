<script setup lang="ts">
import { computed, ref } from "vue"
import { CVideoThumb, type StudioVideo } from "@/entities/video"
import { CBadge, CIcon, CIconButton } from "@/shared/ui"

const props = defineProps<{ videos: StudioVideo[] }>()

type Filter = "all" | "published" | "draft"
const filter = ref<Filter>("all")
const FILTERS: ReadonlyArray<{ value: Filter; label: string }> = [
  { value: "all", label: "Barchasi" },
  { value: "published", label: "Joylangan" },
  { value: "draft", label: "Draft" },
]

const visible = computed(() =>
  filter.value === "all"
    ? props.videos
    : props.videos.filter((video) => video.status === filter.value)
)
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header class="border-b border-[#ECECE8] px-5 py-4">
      <div class="flex items-center justify-between">
        <h2 class="text-[15px] font-semibold text-[#15151B]">Mening videolarim</h2>
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
          class="h-7 flex-1 rounded-[8px] text-[12px] font-semibold transition"
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

    <ul class="flex-1 divide-y divide-[#F1F1EE] overflow-y-auto">
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
            <CBadge
              :tone="video.status === 'published' ? 'success' : 'neutral'"
              size="sm"
            >
              {{ video.status === "published" ? "Joylangan" : "Draft" }}
            </CBadge>
          </div>
        </div>
        <div class="flex shrink-0 items-center gap-0.5">
          <CIconButton
            v-if="video.hasLink"
            icon="external-link"
            label="Havolani ochish"
            variant="ghost"
            size="sm"
          />
          <CIconButton
            icon="download"
            label="Yuklab olish"
            variant="ghost"
            size="sm"
          />
        </div>
      </li>
    </ul>

    <footer
      class="flex items-start gap-2 border-t border-[#ECECE8] px-4 py-3 text-[11.5px] leading-4 text-[#9A9AA2]"
    >
      <CIcon name="info" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
      O'zingiz yaratgan videolar plan statistikasiga ta'sir qilmaydi.
    </footer>
  </section>
</template>
