<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
import {
  CChannelIcon,
  CConversationStatusBadge,
  type ConversationSummary,
} from "@/entities/rag-agent"
import { formatCount, formatTimeAgo } from "@/shared/lib"
import { CSearchField, CSkeleton } from "@/shared/ui"

const props = defineProps<{
  conversations: ConversationSummary[]
  activeId: string
  total: number
  loading?: boolean
}>()

const { locale } = useI18n()
const query = ref("")
const list = ref<HTMLElement | null>(null)

const visible = computed(() => {
  const needle = query.value.trim().toLowerCase()
  if (!needle) return props.conversations
  return props.conversations.filter((item) =>
    `${item.id} ${item.lastMessage}`.toLowerCase().includes(needle)
  )
})

// Arriving from a deep link, the open chat can sit below the fold.
watch(
  () => [props.activeId, props.loading],
  async () => {
    await nextTick()
    list.value
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView({ block: "nearest" })
  },
  { immediate: true }
)
</script>

<template>
  <section
    class="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white"
    aria-labelledby="all-conversations-title"
  >
    <header class="space-y-3 border-b border-[#EEEEEA] p-4">
      <div class="flex items-center justify-between gap-3">
        <h2
          id="all-conversations-title"
          class="text-[15px] font-semibold text-[#15151B]"
        >
          {{ $t("dashboard.rag.conversation.list.title") }}
        </h2>
        <span class="text-[13px] tabular-nums text-[#84848E]">
          {{ formatCount(total, locale) }}
        </span>
      </div>
      <CSearchField
        v-model="query"
        :placeholder="$t('dashboard.rag.conversation.list.search')"
      />
    </header>

    <ul v-if="loading" class="divide-y divide-[#EEEEEA]" aria-busy="true">
      <li v-for="n in 7" :key="n" class="flex gap-3 px-4 py-3.5">
        <CSkeleton class="h-8 w-8 rounded-[9px]" />
        <div class="flex-1 space-y-2">
          <CSkeleton class="h-3.5 w-2/3" />
          <CSkeleton class="h-3 w-full" />
        </div>
      </li>
    </ul>

    <ul
      v-else
      ref="list"
      class="relative min-h-0 flex-1 divide-y divide-[#EEEEEA] overflow-y-auto"
    >
      <li v-for="chat in visible" :key="chat.id">
        <RouterLink
          :to="{ name: 'RagConversation', params: { chatId: chat.id } }"
          class="flex gap-3 px-4 py-3 outline-none transition-colors focus-visible:bg-[#F3F1FF]"
          :class="chat.id === activeId ? 'bg-[#F3F1FF]' : 'hover:bg-[#FAFAF9]'"
          :aria-current="chat.id === activeId ? 'page' : undefined"
        >
          <CChannelIcon :channel="chat.channel" framed />
          <div class="min-w-0 flex-1">
            <div class="flex items-baseline justify-between gap-2">
              <span class="truncate text-[13px] font-semibold text-[#15151B]">
                {{ chat.id }}
              </span>
              <time
                :datetime="chat.updatedAt"
                class="shrink-0 text-xs text-[#84848E]"
              >
                {{ formatTimeAgo(chat.updatedAt, Date.now(), locale) }}
              </time>
            </div>
            <div class="mt-1 flex items-center justify-between gap-2">
              <span class="truncate text-[13px] text-[#6A6A74]">
                {{ chat.lastMessage }}
              </span>
              <CConversationStatusBadge :status="chat.status" size="sm" />
            </div>
          </div>
        </RouterLink>
      </li>
      <li
        v-if="!visible.length"
        class="px-4 py-10 text-center text-[13px] text-[#84848E]"
      >
        {{ $t("dashboard.rag.conversation.list.noMatches", { query }) }}
      </li>
    </ul>
  </section>
</template>
