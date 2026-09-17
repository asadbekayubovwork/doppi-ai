<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRouter } from "vue-router"
import {
  CChannelIcon,
  CConversationStatusBadge,
  CHANNELS,
  type ChannelKind,
  type ConversationSummary,
} from "@/entities/rag-agent"
import { downloadFile, formatCount, formatTimeAgo, toCsv } from "@/shared/lib"
import {
  CBadge,
  CIcon,
  CIconButton,
  CSearchField,
  CSkeleton,
} from "@/shared/ui"
import CChannelFilter from "./CChannelFilter.vue"

const PAGE_SIZE = 10

const props = defineProps<{
  conversations: ConversationSummary[]
  /** All-time count for the agent; the loaded list is a window of it. */
  total: number
  loading?: boolean
}>()

const router = useRouter()
const query = ref("")
const channel = ref<ChannelKind | "all">("all")
const page = ref(1)

const filtered = computed(() => {
  const needle = query.value.trim().toLowerCase()
  return props.conversations.filter(
    (item) =>
      (channel.value === "all" || item.channel === channel.value) &&
      (!needle ||
        `${item.id} ${item.lastMessage}`.toLowerCase().includes(needle))
  )
})

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filtered.value.length / PAGE_SIZE))
)
const firstIndex = computed(() => (page.value - 1) * PAGE_SIZE)
const rows = computed(() =>
  filtered.value.slice(firstIndex.value, firstIndex.value + PAGE_SIZE)
)
const rangeLabel = computed(() =>
  rows.value.length
    ? `${firstIndex.value + 1}–${firstIndex.value + rows.value.length}`
    : "0"
)

watch([query, channel], () => (page.value = 1))
// A refresh can shrink the list from under the current page.
watch(pageCount, (count) => {
  if (page.value > count) page.value = count
})

const conversationRoute = (chatId: string) => ({
  name: "RagConversation",
  params: { chatId },
})

const openRow = (event: MouseEvent, chatId: string) => {
  // The chat id cell is a real link (keyboard, middle click); let it navigate.
  if ((event.target as HTMLElement).closest("a")) return
  router.push(conversationRoute(chatId))
}

const exportCsv = () => {
  const header = [
    "chat_id",
    "channel",
    "last_message",
    "messages",
    "status",
    "updated_at",
  ]
  const body = filtered.value.map((item) => [
    item.id,
    CHANNELS[item.channel].label,
    item.lastMessage,
    item.messageCount,
    item.status,
    item.updatedAt,
  ])
  const date = new Date().toISOString().slice(0, 10)
  downloadFile(
    `conversations-${date}.csv`,
    toCsv([header, ...body]),
    "text/csv;charset=utf-8"
  )
}
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white"
    aria-labelledby="conversations-title"
  >
    <header
      class="flex flex-col gap-3 px-5 py-3.5 lg:flex-row lg:items-center lg:justify-between"
    >
      <div class="flex items-center gap-2.5">
        <h2
          id="conversations-title"
          class="text-[15px] font-semibold text-[#15151B]"
        >
          Conversations
        </h2>
        <CBadge tone="accent">{{ formatCount(total) }} chats</CBadge>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <CSearchField
          v-model="query"
          placeholder="Search chat_id"
          label="Search conversations"
          class="w-full sm:w-56"
        />
        <CChannelFilter v-model="channel" />
        <CIconButton
          icon="download"
          label="Export as CSV"
          :disabled="loading || !filtered.length"
          @click="exportCsv"
        />
      </div>
    </header>

    <div class="relative overflow-x-auto border-y border-[#EEEEEA]">
      <table class="w-full min-w-[760px] text-left text-[13px]">
        <thead
          class="whitespace-nowrap bg-[#FAFAF9] text-[10.5px] uppercase tracking-[0.08em] text-[#84848E]"
        >
          <tr>
            <th scope="col" class="px-5 py-2.5 font-semibold">Chat ID</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Channel</th>
            <th scope="col" class="w-full px-4 py-2.5 font-semibold">
              Last message
            </th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Msgs</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Status</th>
            <th scope="col" class="px-4 py-2.5 font-semibold">Updated</th>
            <th scope="col" class="px-4 py-2.5">
              <span class="sr-only">Open</span>
            </th>
          </tr>
        </thead>

        <tbody v-if="loading" class="divide-y divide-[#EEEEEA]">
          <tr v-for="n in 6" :key="n">
            <td class="px-5 py-3.5"><CSkeleton class="h-4 w-28" /></td>
            <td class="px-4 py-3.5"><CSkeleton class="h-4 w-20" /></td>
            <td class="px-4 py-3.5"><CSkeleton class="h-4 w-3/4" /></td>
            <td class="px-4 py-3.5"><CSkeleton class="h-4 w-6" /></td>
            <td class="px-4 py-3.5">
              <CSkeleton class="h-5 w-16 rounded-full" />
            </td>
            <td class="px-4 py-3.5"><CSkeleton class="h-4 w-12" /></td>
            <td class="px-4 py-3.5" />
          </tr>
        </tbody>

        <tbody v-else class="divide-y divide-[#EEEEEA]">
          <tr
            v-for="chat in rows"
            :key="chat.id"
            class="cursor-pointer transition-colors hover:bg-[#FAFAF9]"
            @click="openRow($event, chat.id)"
          >
            <td class="whitespace-nowrap px-5 py-3">
              <RouterLink
                :to="conversationRoute(chat.id)"
                class="inline-flex items-center gap-2 font-medium text-[#15151B] outline-none hover:text-[#5B4BE8] focus-visible:text-[#5B4BE8] focus-visible:underline"
              >
                <CIcon name="message-square" class="h-4 w-4 text-[#5B4BE8]" />
                {{ chat.id }}
              </RouterLink>
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-[#3F3F46]">
              <span class="inline-flex items-center gap-2">
                <CChannelIcon :channel="chat.channel" />
                {{ CHANNELS[chat.channel].label }}
              </span>
            </td>
            <td class="max-w-0 truncate px-4 py-3 text-[#3F3F46]">
              {{ chat.lastMessage }}
            </td>
            <td class="px-4 py-3 font-medium tabular-nums text-[#15151B]">
              {{ chat.messageCount }}
            </td>
            <td class="px-4 py-3">
              <CConversationStatusBadge :status="chat.status" />
            </td>
            <td class="whitespace-nowrap px-4 py-3 text-[#84848E]">
              <time :datetime="chat.updatedAt">
                {{ formatTimeAgo(chat.updatedAt) }}
              </time>
            </td>
            <td class="px-4 py-3 text-[#84848E]">
              <CIcon name="chevron-right" class="h-4 w-4" />
            </td>
          </tr>
          <tr v-if="!rows.length">
            <td colspan="7" class="px-5 py-12 text-center text-[#84848E]">
              {{
                conversations.length
                  ? "No conversations match your filters."
                  : "No conversations yet — they show up here once customers write in."
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <footer class="flex items-center justify-between gap-3 px-5 py-3">
      <p class="text-[13px] text-[#84848E]">
        Showing {{ rangeLabel }} of {{ formatCount(filtered.length) }}
        conversations
      </p>
      <div class="flex gap-2">
        <CIconButton
          icon="chevron-left"
          label="Previous page"
          size="sm"
          :disabled="loading || page === 1"
          @click="page -= 1"
        />
        <CIconButton
          icon="chevron-right"
          label="Next page"
          size="sm"
          :disabled="loading || page >= pageCount"
          @click="page += 1"
        />
      </div>
    </footer>
  </section>
</template>
