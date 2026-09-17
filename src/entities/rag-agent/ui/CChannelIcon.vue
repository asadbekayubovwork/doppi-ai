<script setup lang="ts">
import { computed } from "vue"
import { CIcon } from "@/shared/ui"
import { CHANNELS } from "../model/channels"
import type { ChannelKind } from "../model/types"

const props = defineProps<{
  channel: ChannelKind
  /** Draws the icon inside a bordered tile, as list rows and cards do. */
  framed?: boolean
}>()

const meta = computed(() => CHANNELS[props.channel])
</script>

<template>
  <span
    v-if="framed"
    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-[#E5E5E1] bg-white"
    :class="meta.tone"
  >
    <CIcon :name="meta.icon" class="h-4 w-4" />
  </span>
  <CIcon v-else :name="meta.icon" class="h-4 w-4 shrink-0" :class="meta.tone" />
</template>
