<script setup lang="ts">
import { computed } from "vue"
import { CHANNELS, type ConversationDetail } from "@/entities/rag-agent"
import { formatClockTime, formatDayLabel, formatDuration } from "@/shared/lib"
import { CIconButton } from "@/shared/ui"
import CInsightCard from "./CInsightCard.vue"

const props = defineProps<{ conversation: ConversationDetail }>()

defineEmits<{ copyId: [] }>()

const rows = computed(() => {
  const chat = props.conversation
  return [
    { label: "Channel", value: CHANNELS[chat.channel].product },
    { label: "Customer", value: chat.customer.name },
    {
      label: "Started",
      value: `${formatDayLabel(chat.startedAt)} · ${formatClockTime(chat.startedAt)}`,
    },
    {
      label: "Duration",
      value: formatDuration(chat.startedAt, chat.updatedAt),
    },
    {
      label: "Messages",
      value: `${chat.messageCount} (${chat.agentMessageCount} agent)`,
    },
    { label: "Handled by", value: chat.handledBy },
    {
      label: "Escalation",
      value: chat.handoverTo
        ? `Handed to ${chat.handoverTo}`
        : "No human handover",
    },
  ]
})
</script>

<template>
  <CInsightCard title="Chat details" icon="info">
    <dl class="space-y-2.5 px-4 py-3.5 text-[13px]">
      <div class="flex items-center justify-between gap-3">
        <dt class="shrink-0 text-[#84848E]">chat_id</dt>
        <dd class="flex min-w-0 items-center gap-1 font-medium text-[#15151B]">
          <span class="truncate">{{ conversation.id }}</span>
          <CIconButton
            icon="copy"
            label="Copy chat_id"
            variant="ghost"
            size="xs"
            @click="$emit('copyId')"
          />
        </dd>
      </div>
      <div
        v-for="row in rows"
        :key="row.label"
        class="flex items-center justify-between gap-3"
      >
        <dt class="shrink-0 text-[#84848E]">{{ row.label }}</dt>
        <dd class="min-w-0 truncate text-right font-medium text-[#15151B]">
          {{ row.value }}
        </dd>
      </div>
    </dl>
  </CInsightCard>
</template>
