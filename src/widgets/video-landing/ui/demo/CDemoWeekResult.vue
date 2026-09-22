<script setup lang="ts">
import { useI18nList } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import weekPhoto from "@/shared/assets/png/vg-week-result.jpg"

interface Reaction {
  icon: string
  count: string
}

// Step 04: the week, already done, seen from the owner's phone.
const base = "services.video.landing.demo.week"
const days = useI18nList<string>("services.video.landing.demo.days")
const reactions = useI18nList<Reaction>(`${base}.reactions`)
</script>

<template>
  <div
    class="relative w-full overflow-hidden rounded-[20px]"
    role="img"
    :aria-label="$t(`${base}.alt`)"
  >
    <img
      :src="weekPhoto"
      alt=""
      class="aspect-[3/2] w-full object-cover"
      loading="lazy"
      decoding="async"
    />

    <!-- The week, summed up over the photo -->
    <div
      class="absolute left-3 top-3 flex flex-col gap-2 rounded-2xl border border-white/15 bg-sand-950/75 p-3.5 backdrop-blur-sm sm:left-4 sm:top-4"
      aria-hidden="true"
    >
      <span
        class="flex items-center gap-2 text-[12.5px] font-semibold text-white"
      >
        <CIcon name="circle-check" class="h-3.5 w-3.5 text-signal" />
        {{ $t(`${base}.title`) }}
      </span>
      <span class="flex flex-wrap gap-1.5">
        <span
          v-for="day in days"
          :key="day"
          class="grid h-[22px] w-[26px] place-items-center rounded-md bg-signal/25 text-[9.5px] font-semibold text-signal"
        >
          {{ day }}
        </span>
      </span>
    </div>

    <div
      class="absolute bottom-3 left-3 flex flex-wrap items-center gap-4 rounded-2xl border border-white/15 bg-sand-950/75 px-4 py-3 backdrop-blur-sm sm:bottom-4 sm:left-4"
      aria-hidden="true"
    >
      <span
        v-for="reaction in reactions"
        :key="reaction.icon"
        class="flex items-center gap-1.5 text-sm font-semibold text-white"
      >
        <CIcon :name="reaction.icon" class="h-[15px] w-[15px]" />
        {{ reaction.count }}
      </span>
    </div>
  </div>
</template>
