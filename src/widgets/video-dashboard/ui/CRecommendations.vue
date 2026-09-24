<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { CVideoThumb, type Recommendation } from "@/entities/video"
import { CBadge, CIcon } from "@/shared/ui"
import CSegmentedControl from "./CSegmentedControl.vue"

const props = defineProps<{ items: Recommendation[] }>()

const { t } = useI18n()

type Tab = "franchise" | "trend"
const tab = ref<Tab>("franchise")
const tabs = computed<ReadonlyArray<{ value: Tab; label: string }>>(() => [
  {
    value: "franchise",
    label: t("dashboard.video.dashboard.recommendations.franchise"),
  },
  { value: "trend", label: t("dashboard.video.dashboard.recommendations.trending") },
])

const source = (item: Recommendation) =>
  item.author ??
  t("dashboard.video.dashboard.recommendations.trendingPosts", {
    count: item.trendPosts ?? "",
  })

const visible = computed(() =>
  tab.value === "trend"
    ? props.items.filter((item) => item.trending)
    : props.items
)
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5 shadow-[0_12px_32px_rgba(22,22,27,0.04)] sm:p-6"
  >
    <header class="flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2.5">
        <h2 class="text-[16px] font-semibold text-[#15151B]">
          {{ $t("dashboard.video.dashboard.recommendations.title") }}
        </h2>
        <CBadge tone="accent" icon="wand-sparkles">
          {{ $t("dashboard.video.dashboard.recommendations.agent") }}
        </CBadge>
      </div>
      <div class="flex items-center gap-3">
        <CSegmentedControl v-model="tab" :options="tabs" />
        <span class="hidden text-[12px] text-[#9A9AA2] lg:inline">
          {{ $t("dashboard.video.dashboard.recommendations.updated", { time: "06:00" }) }}
        </span>
      </div>
    </header>

    <ul
      class="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5"
    >
      <li
        v-for="item in visible"
        :key="item.id"
        class="group overflow-hidden rounded-xl border border-[#EEEEEA] bg-white transition hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-24px_rgba(21,21,27,0.4)]"
      >
        <CVideoThumb
          :color="item.thumbnail"
          play
          rounded="rounded-none"
          class="aspect-[4/5] w-full"
        >
          <span
            v-if="item.trending"
            class="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10.5px] font-semibold text-white"
          >
            <CIcon name="trending-up" class="h-3 w-3" />
            {{ $t("dashboard.video.dashboard.recommendations.trend") }}
          </span>
          <span
            class="absolute right-2 top-2 inline-flex items-center gap-1 rounded-md bg-black/55 px-1.5 py-0.5 text-[10.5px] font-semibold text-white"
          >
            <CIcon name="eye" class="h-3 w-3" />
            {{ item.views }}
          </span>
        </CVideoThumb>
        <div class="p-3">
          <p class="truncate text-[13px] font-semibold text-[#24242A]">
            {{ item.title }}
          </p>
          <p class="mt-0.5 truncate text-[11.5px] text-[#9A9AA2]">
            {{ source(item) }} ·
            {{ $t(`dashboard.video.dashboard.recommendations.tags.${item.tag}`) }}
          </p>
          <div class="mt-2.5 flex items-center justify-between gap-2">
            <CBadge tone="success" size="sm">{{ item.engagement }}</CBadge>
            <button
              type="button"
              class="inline-flex items-center gap-1 rounded-lg border border-[#E5E5E1] px-2 py-1 text-[11.5px] font-semibold text-[#42424B] transition hover:border-[#D6D6D1] hover:bg-[#FAFAF9]"
            >
              <CIcon name="plus" class="h-3.5 w-3.5" />
              {{ $t("dashboard.video.dashboard.recommendations.addToPlan") }}
            </button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
