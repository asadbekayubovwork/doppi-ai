<script setup lang="ts">
import { CIcon } from "@/shared/ui"
import { agentMetrics } from "../model/data"
</script>

<template>
  <section class="rounded-2xl border border-[#E5E5EA] bg-white px-5 py-5 shadow-[0_1px_2px_rgba(18,18,28,0.02)] sm:px-6">
    <div class="flex flex-col gap-4 border-b border-[#E8E8ED] pb-4 xl:flex-row xl:items-center xl:justify-between">
      <div class="flex min-w-0 items-start gap-4">
        <span class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[#6046E8] text-white">
          <CIcon name="bot" class="h-8 w-8" />
        </span>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-xl font-bold tracking-tight text-[#181820]">Aura Support Agent</h2>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-[#E7F6EE] px-2.5 py-1 text-xs font-semibold text-[#218658]"><i class="h-1.5 w-1.5 rounded-full bg-[#218658]" />Live</span>
            <span class="inline-flex items-center gap-1.5 rounded-full border border-[#E6E5EA] px-2.5 py-1 text-xs font-medium text-[#8C8A96]"><CIcon name="lock" class="h-3.5 w-3.5" />One agent per business</span>
          </div>
          <div class="mt-2 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-[#777583]">
            <span class="inline-flex items-center gap-2"><CIcon name="cpu" class="h-4 w-4" />GPT-4o · temperature 0.3</span>
            <span class="inline-flex items-center gap-2"><CIcon name="database" class="h-4 w-4" />128 documents · 24,381 chunks</span>
            <span class="inline-flex items-center gap-2"><CIcon name="share-2" class="h-4 w-4" />Instagram · Telegram · WhatsApp</span>
          </div>
        </div>
      </div>
      <div class="flex shrink-0 gap-3">
        <button type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-[#E3E2E8] px-4 text-sm font-semibold text-[#65636E] transition hover:bg-[#F8F8FA]"><CIcon name="sliders-horizontal" class="h-4 w-4" />Edit configuration</button>
        <button type="button" class="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#6046E8] px-4 text-sm font-semibold text-white transition hover:bg-[#5239DB]"><CIcon name="sparkles" class="h-4 w-4" />Open playground</button>
      </div>
    </div>

    <div class="mt-4 grid grid-cols-2 divide-x-0 divide-y divide-[#E8E8ED] sm:grid-cols-3 lg:grid-cols-5 lg:divide-x lg:divide-y-0">
      <div v-for="metric in agentMetrics" :key="metric.label" class="py-3 first:pt-0 sm:px-5 sm:first:pl-0 lg:py-0">
        <p class="text-[13px] font-medium text-[#7D7B88]">{{ metric.label }}</p>
        <div class="mt-1 flex flex-wrap items-center gap-2"><strong class="text-[26px] leading-none tracking-tight text-[#202028]">{{ metric.value }}</strong><span class="rounded-full bg-[#E7F6EE] px-2 py-1 text-xs font-semibold text-[#258A5D]">{{ metric.change }}</span></div>
      </div>
    </div>
  </section>
</template>
