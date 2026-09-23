<script setup lang="ts">
import { computed } from "vue"
import { CHANNEL_KINDS, CHANNELS, type ChannelKind } from "@/entities/rag-agent"
import { CSelect } from "@/shared/ui"

const model = defineModel<ChannelKind | "all">({ default: "all" })

const options = computed(() => [
  { value: "all" as const, label: "All channels" },
  ...CHANNEL_KINDS.map((kind) => ({
    value: kind,
    label: CHANNELS[kind].label,
  })),
])
</script>

<template>
  <CSelect
    v-model="model"
    :options="options"
    aria-label="Filter by channel"
    icon="list-filter"
    size="sm"
    class="w-44"
  />
</template>
