<script setup lang="ts">
import { CIcon } from "@/shared/ui"
import { connectedChannels } from "../model/data"
</script>

<template>
  <section class="rounded-2xl border border-[#E5E5EA] bg-white shadow-[0_1px_2px_rgba(18,18,28,0.02)]">
    <header class="flex items-center justify-between border-b border-[#E8E8ED] px-5 py-4"><h2 class="text-lg font-bold text-[#22222A]">Connected channels</h2><button type="button" class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E3E2E8] px-2.5 text-xs font-semibold text-[#6E6C77]"><CIcon name="plus" class="h-3.5 w-3.5" />Add</button></header>
    <div class="space-y-2 p-5">
      <article v-for="channel in connectedChannels" :key="channel.name" class="flex items-center gap-3 rounded-xl border border-[#E8E8ED] px-3 py-2.5"><span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E8E8ED]" :class="channel.state === 'Reconnect' ? 'text-[#20C77A]' : channel.name === 'Instagram' ? 'text-[#FD4B80]' : 'text-[#25A6E9]'"><CIcon :name="channel.icon" class="h-5 w-5" /></span><div class="min-w-0 flex-1"><h3 class="text-sm font-semibold text-[#44434C]">{{ channel.name }}</h3><p class="truncate text-xs text-[#9795A0]">{{ channel.detail }}</p></div><span v-if="channel.state === 'Connected'" class="inline-flex items-center gap-1 rounded-full bg-[#E7F6EE] px-2 py-1 text-xs font-semibold text-[#218658]"><i class="h-1.5 w-1.5 rounded-full bg-[#218658]" />Connected</span><button v-else type="button" class="rounded-lg bg-[#6046E8] px-2.5 py-1.5 text-xs font-semibold text-white">Reconnect</button></article>
    </div>
  </section>
</template>
