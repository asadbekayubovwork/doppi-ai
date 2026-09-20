<script setup lang="ts">
import {
  PLATFORMS,
  PLATFORM_CHANNELS,
  type ChannelShare,
} from "@/entities/video"
import { CIcon } from "@/shared/ui"

defineProps<{ channels: ChannelShare[] }>()
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5 shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <div class="flex items-center justify-between">
      <h2 class="text-[15px] font-semibold text-[#15151B]">
        Ko'rishlar · kanallar
      </h2>
      <span class="text-[12px] text-[#9A9AA2]">30 kun</span>
    </div>

    <ul class="mt-4 space-y-4">
      <li v-for="channel in channels" :key="channel.platform">
        <div class="flex items-center justify-between gap-3">
          <span class="inline-flex items-center gap-2">
            <span
              class="grid h-6 w-6 place-items-center rounded-md"
              :style="{
                backgroundColor: PLATFORMS[channel.platform].bg,
                color: PLATFORMS[channel.platform].color,
              }"
            >
              <CIcon :name="PLATFORMS[channel.platform].icon" class="h-3.5 w-3.5" />
            </span>
            <span class="text-[13px] font-medium text-[#42424B]">
              {{ PLATFORM_CHANNELS[channel.platform] }}
            </span>
          </span>
          <span class="flex items-baseline gap-2">
            <span class="text-[13.5px] font-bold tabular-nums text-[#15151B]">
              {{ channel.views }}
            </span>
            <span class="text-[12px] tabular-nums text-[#9A9AA2]">
              {{ channel.percent }}%
            </span>
          </span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EEEEEA]">
          <div
            class="h-full rounded-full"
            :style="{
              width: `${channel.percent}%`,
              backgroundColor: PLATFORMS[channel.platform].color,
            }"
          />
        </div>
      </li>
    </ul>
  </section>
</template>
