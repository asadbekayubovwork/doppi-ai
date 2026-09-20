<script setup lang="ts">
import { ref } from "vue"
import { CPlatformPill, CVideoThumb, type TopVideo } from "@/entities/video"
import { CBadge } from "@/shared/ui"
import CSegmentedControl from "./CSegmentedControl.vue"

defineProps<{ videos: TopVideo[] }>()

type Range = "7" | "30" | "all"
const range = ref<Range>("30")
const RANGES: ReadonlyArray<{ value: Range; label: string }> = [
  { value: "7", label: "7 kun" },
  { value: "30", label: "30 kun" },
  { value: "all", label: "Barchasi" },
]
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header
      class="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6"
    >
      <h2 class="text-[16px] font-semibold text-[#15151B]">
        Top performing videos
      </h2>
      <CSegmentedControl v-model="range" :options="RANGES" />
    </header>

    <div class="overflow-x-auto">
      <table class="w-full min-w-[640px] border-collapse text-left">
        <thead>
          <tr
            class="border-y border-[#EEEEEA] text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9A9AA2]"
          >
            <th class="w-10 py-2.5 pl-5 pr-2 sm:pl-6">#</th>
            <th class="px-2 py-2.5">Video</th>
            <th class="px-2 py-2.5">Platforma</th>
            <th class="px-2 py-2.5">Sana</th>
            <th class="px-2 py-2.5">Ko'rishlar</th>
            <th class="px-2 py-2.5">Engagement</th>
            <th class="px-2 py-2.5 pr-5 sm:pr-6">O'sish</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F1F1EE]">
          <tr
            v-for="video in videos"
            :key="video.id"
            class="group transition hover:bg-[#FCFCFA]"
          >
            <td class="py-3 pl-5 pr-2 text-[13px] font-semibold text-[#5B4BE8] sm:pl-6">
              {{ video.rank }}
            </td>
            <td class="px-2 py-3">
              <div class="flex items-center gap-3">
                <CVideoThumb
                  :color="video.thumbnail"
                  rounded="rounded-lg"
                  class="h-9 w-12 shrink-0"
                />
                <div class="min-w-0">
                  <p class="truncate text-[13.5px] font-semibold text-[#24242A]">
                    {{ video.title }}
                  </p>
                  <p class="truncate text-[11.5px] text-[#9A9AA2]">
                    {{ video.period }}
                  </p>
                </div>
              </div>
            </td>
            <td class="px-2 py-3">
              <CPlatformPill :platform="video.platform" />
            </td>
            <td class="px-2 py-3 text-[13px] text-[#73737D]">
              {{ video.date }}
            </td>
            <td class="px-2 py-3 text-[14px] font-bold tabular-nums text-[#15151B]">
              {{ video.views }}
            </td>
            <td class="px-2 py-3 text-[13px] font-medium tabular-nums text-[#42424B]">
              {{ video.engagement }}
            </td>
            <td class="px-2 py-3 pr-5 sm:pr-6">
              <CBadge tone="success" size="sm" icon="trending-up">
                {{ video.growth }}
              </CBadge>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>
