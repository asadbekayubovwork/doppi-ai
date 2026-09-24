<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { CHANNEL_KINDS, CHANNELS, type ChannelKind } from "@/entities/rag-agent"
import { CSelect } from "@/shared/ui"

const model = defineModel<ChannelKind | "all">({ default: "all" })

const { t } = useI18n()
const options = computed(() => [
  { value: "all" as const, label: t("dashboard.rag.table.allChannels") },
  ...CHANNEL_KINDS.map((kind) => ({
    value: kind,
    label: t(CHANNELS[kind].label),
  })),
])
</script>

<template>
  <CSelect
    v-model="model"
    :options="options"
    :aria-label="$t('dashboard.rag.table.filterLabel')"
    icon="list-filter"
    size="sm"
    class="w-44"
  />
</template>
