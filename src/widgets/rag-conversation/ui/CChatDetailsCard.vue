<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { CHANNELS, type ConversationDetail } from "@/entities/rag-agent"
import { formatClockTime, formatDayLabel, formatDuration } from "@/shared/lib"
import { CIconButton } from "@/shared/ui"
import CInsightCard from "./CInsightCard.vue"

const props = defineProps<{ conversation: ConversationDetail }>()

defineEmits<{ copyId: [] }>()

const { t, locale } = useI18n()

const rows = computed(() => {
  const chat = props.conversation
  const label = (key: string) => t(`dashboard.rag.conversation.details.${key}`)
  return [
    { label: label("channel"), value: t(CHANNELS[chat.channel].product) },
    { label: label("customer"), value: chat.customer.name },
    {
      label: label("started"),
      value: `${formatDayLabel(chat.startedAt, new Date(), locale.value)} · ${formatClockTime(chat.startedAt)}`,
    },
    {
      label: label("duration"),
      value: formatDuration(chat.startedAt, chat.updatedAt, locale.value),
    },
    {
      label: label("messages"),
      value: t("dashboard.rag.conversation.details.messagesValue", {
        count: chat.messageCount,
        agent: chat.agentMessageCount,
      }),
    },
    { label: label("handledBy"), value: chat.handledBy },
    {
      label: label("escalation"),
      value: chat.handoverTo
        ? t("dashboard.rag.conversation.details.handedTo", {
            name: chat.handoverTo,
          })
        : label("noHandover"),
    },
  ]
})
</script>

<template>
  <CInsightCard
    :title="$t('dashboard.rag.conversation.details.title')"
    icon="info"
  >
    <dl class="space-y-2.5 px-4 py-3.5 text-[13px]">
      <div class="flex items-center justify-between gap-3">
        <dt class="shrink-0 text-[#84848E]">chat_id</dt>
        <dd class="flex min-w-0 items-center gap-1 font-medium text-[#15151B]">
          <span class="truncate">{{ conversation.id }}</span>
          <CIconButton
            icon="copy"
            :label="$t('dashboard.rag.conversation.details.copyId')"
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
