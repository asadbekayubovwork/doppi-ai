<script setup lang="ts">
import {
  CChannelIcon,
  CConversationStatusBadge,
  CHANNELS,
  type ConversationDetail,
} from "@/entities/rag-agent"
import { CAppButton, CBadge, CIcon } from "@/shared/ui"

defineProps<{
  chatId: string
  conversation: ConversationDetail | null
  /** Whether the signed-in teammate is the one handling the chat. */
  isHandledByMe: boolean
  handoverBusy?: boolean
}>()

defineEmits<{ export: []; toggleHandover: [] }>()
</script>

<template>
  <div class="flex flex-wrap items-center gap-3">
    <RouterLink
      :to="{ name: 'RagAgent' }"
      class="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] border border-[#E5E5E1] bg-white text-[#6A6A74] transition hover:bg-[#FAFAF9] hover:text-[#15151B]"
      :aria-label="$t('dashboard.rag.conversation.back')"
    >
      <CIcon name="arrow-left" class="h-4 w-4" />
    </RouterLink>

    <nav :aria-label="$t('dashboard.rag.conversation.breadcrumb')" class="min-w-0">
      <ol class="flex items-center gap-2 text-sm">
        <li>
          <RouterLink
            :to="{ name: 'RagAgent' }"
            class="text-[#6A6A74] transition hover:text-[#15151B]"
          >
            {{ $t("dashboard.rag.conversation.breadcrumb") }}
          </RouterLink>
        </li>
        <li aria-hidden="true">
          <CIcon name="chevron-right" class="h-4 w-4 text-[#A1A1AA]" />
        </li>
        <li class="truncate font-semibold text-[#15151B]" aria-current="page">
          {{ chatId }}
        </li>
      </ol>
    </nav>

    <template v-if="conversation">
      <CBadge tone="outline">
        <CChannelIcon :channel="conversation.channel" />
        {{ $t(CHANNELS[conversation.channel].label) }}
      </CBadge>
      <CConversationStatusBadge :status="conversation.status" dot />

      <div class="flex flex-wrap gap-2.5 sm:ml-auto">
        <CAppButton icon="download" @click="$emit('export')">
          {{ $t("dashboard.rag.conversation.export") }}
        </CAppButton>
        <CAppButton
          :variant="isHandledByMe ? 'secondary' : 'primary'"
          :icon="isHandledByMe ? 'bot' : 'user-round-check'"
          :loading="handoverBusy"
          @click="$emit('toggleHandover')"
        >
          {{
            $t(
              isHandledByMe
                ? "dashboard.rag.conversation.handBack"
                : "dashboard.rag.conversation.takeOver"
            )
          }}
        </CAppButton>
      </div>
    </template>
  </div>
</template>
