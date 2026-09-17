<script setup lang="ts">
import { CHANNEL_KINDS, CHANNELS, type ChannelKind } from "@/entities/rag-agent"
import { CIcon } from "@/shared/ui"

const model = defineModel<ChannelKind | "all">({ default: "all" })
</script>

<template>
  <label class="relative inline-flex">
    <span class="sr-only">Filter by channel</span>
    <CIcon
      name="list-filter"
      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6A6A74]"
    />
    <select
      v-model="model"
      class="h-9 cursor-pointer appearance-none rounded-[10px] border border-[#E5E5E1] bg-white pl-9 pr-9 text-[13px] font-medium text-[#15151B] outline-none transition hover:bg-[#FAFAF9] focus:border-[#5B4BE8] focus:ring-2 focus:ring-[#5B4BE8]/15"
    >
      <option value="all">All channels</option>
      <option v-for="kind in CHANNEL_KINDS" :key="kind" :value="kind">
        {{ CHANNELS[kind].label }}
      </option>
    </select>
    <CIcon
      name="chevron-down"
      class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84848E]"
    />
  </label>
</template>
