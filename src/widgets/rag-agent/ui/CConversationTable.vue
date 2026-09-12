<script setup lang="ts">
import { computed, ref } from "vue"
import { CIcon } from "@/shared/ui"
import { conversations } from "../model/data"

const query = ref("")
const channel = ref("All channels")
const visibleConversations = computed(() => {
  const normalizedQuery = query.value.trim().toLowerCase()
  return conversations.filter((item) => {
    const matchesSearch = !normalizedQuery || `${item.id} ${item.message}`.toLowerCase().includes(normalizedQuery)
    return matchesSearch && (channel.value === "All channels" || item.channel === channel.value)
  })
})

const channelIcon = (name: string) => ({ Instagram: "instagram", Telegram: "send", WhatsApp: "message-circle", "Web widget": "globe" })[name] ?? "message-square"
const channelTone = (name: string) => ({ Instagram: "text-[#FD4B80]", Telegram: "text-[#25A6E9]", WhatsApp: "text-[#20C77A]", "Web widget": "text-[#747684]" })[name] ?? "text-[#747684]"
const statusTone = (name: string) => ({ Resolved: "bg-[#E7F6EE] text-[#218658]", Active: "bg-[#F0EDFF] text-[#634CE6]", Escalated: "bg-[#FFF1DF] text-[#CC741C]" })[name] ?? ""
</script>

<template>
  <section class="overflow-hidden rounded-2xl border border-[#E5E5EA] bg-white shadow-[0_1px_2px_rgba(18,18,28,0.02)]">
    <div class="flex flex-col gap-3 border-b border-[#E8E8ED] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div class="flex items-center gap-3"><h2 class="text-lg font-bold text-[#22222A]">Conversations</h2><span class="rounded-full bg-[#F0EDFF] px-3 py-1 text-xs font-semibold text-[#7058EE]">8,942 chats</span></div>
      <div class="flex flex-wrap gap-2">
        <label class="relative"><span class="sr-only">Search chats</span><CIcon name="search" class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9B99A5]" /><input v-model="query" type="search" placeholder="Search chat_id" class="h-10 w-[228px] rounded-xl border border-[#E3E2E8] bg-[#FCFCFD] pl-9 pr-3 text-sm outline-none placeholder:text-[#9B99A5] focus:border-[#6046E8]" /></label>
        <select v-model="channel" class="h-10 rounded-xl border border-[#E3E2E8] bg-[#FCFCFD] px-3 text-sm font-medium text-[#777583] outline-none"><option>All channels</option><option>Instagram</option><option>Telegram</option><option>WhatsApp</option><option>Web widget</option></select>
        <button type="button" class="flex h-10 w-10 items-center justify-center rounded-xl border border-[#E3E2E8] text-[#777583] transition hover:bg-[#F8F8FA]"><CIcon name="download" class="h-4 w-4" /></button>
      </div>
    </div>
    <div class="overflow-x-auto">
      <table class="w-full min-w-[820px] text-left">
        <thead class="border-b border-[#E8E8ED] bg-[#FCFCFD] text-[11px] font-bold uppercase tracking-[0.07em] text-[#94929E]"><tr><th class="px-5 py-3">Chat ID</th><th class="px-4 py-3">Channel</th><th class="px-4 py-3">Last message</th><th class="px-4 py-3">Msgs</th><th class="px-4 py-3">Status</th><th class="px-4 py-3">Updated</th><th class="w-10 px-3 py-3" /></tr></thead>
        <tbody class="divide-y divide-[#ECECF0]">
          <tr v-for="chat in visibleConversations" :key="chat.id" class="transition hover:bg-[#FAFAFC]"><td class="whitespace-nowrap px-5 py-3.5 text-sm font-semibold text-[#393842]"><span class="inline-flex items-center gap-2"><CIcon name="message-square" class="h-[18px] w-[18px] text-[#7058EE]" />{{ chat.id }}</span></td><td class="whitespace-nowrap px-4 py-3.5 text-sm text-[#7B7986]"><span class="inline-flex items-center gap-2"><CIcon :name="channelIcon(chat.channel)" class="h-[18px] w-[18px]" :class="channelTone(chat.channel)" />{{ chat.channel }}</span></td><td class="max-w-[255px] truncate px-4 py-3.5 text-sm text-[#7B7986]">{{ chat.message }}</td><td class="px-4 py-3.5 text-sm font-semibold text-[#44434C]">{{ chat.messages }}</td><td class="px-4 py-3.5"><span class="rounded-full px-2.5 py-1 text-xs font-semibold" :class="statusTone(chat.status)">{{ chat.status }}</span></td><td class="whitespace-nowrap px-4 py-3.5 text-sm text-[#92909B]">{{ chat.updated }}</td><td class="px-3 py-3.5"><CIcon name="chevron-right" class="h-4 w-4 text-[#9C9AA5]" /></td></tr>
          <tr v-if="!visibleConversations.length"><td colspan="7" class="px-5 py-12 text-center text-sm text-[#8F8D99]">No conversations match your search.</td></tr>
        </tbody>
      </table>
    </div>
    <footer class="flex items-center justify-between border-t border-[#E8E8ED] px-5 py-3"><p class="text-sm text-[#9694A0]">Showing {{ visibleConversations.length }} of 8,942 conversations</p><div class="flex gap-2"><button class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E4E9] text-[#9997A2]"><CIcon name="chevron-left" class="h-4 w-4" /></button><button class="flex h-9 w-9 items-center justify-center rounded-lg border border-[#E5E4E9] text-[#9997A2]"><CIcon name="chevron-right" class="h-4 w-4" /></button></div></footer>
  </section>
</template>
