<script setup lang="ts">
import { computed } from "vue"
import { CBadge } from "@/shared/ui"
import { CONVERSATION_STATUS } from "../model/conversation-status"
import type { ConversationStatus } from "../model/types"

const props = defineProps<{
  status: ConversationStatus
  dot?: boolean
  size?: "sm" | "md"
}>()

const meta = computed(() => CONVERSATION_STATUS[props.status])
</script>

<template>
  <CBadge :tone="meta.tone" :dot="dot" :size="size">{{
    $t(meta.label)
  }}</CBadge>
</template>
