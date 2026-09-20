<script setup lang="ts">
import { computed } from "vue"
import { CIcon } from "@/shared/ui"
import { PLATFORMS, PLATFORM_CHANNELS } from "../model/platforms"
import type { PlatformKind } from "../model/types"

const props = withDefaults(
  defineProps<{
    platform: PlatformKind
    /** Use the longer channel label ("Instagram Reels"). */
    channel?: boolean
    /** Icon-only chip. */
    iconOnly?: boolean
  }>(),
  { channel: false, iconOnly: false }
)

const meta = computed(() => PLATFORMS[props.platform])
const label = computed(() =>
  props.channel ? PLATFORM_CHANNELS[props.platform] : meta.value.label
)
</script>

<template>
  <span
    v-if="iconOnly"
    class="grid h-5 w-5 shrink-0 place-items-center rounded-md"
    :style="{ backgroundColor: meta.bg, color: meta.color }"
    :title="label"
  >
    <CIcon :name="meta.icon" class="h-3.5 w-3.5" />
  </span>
  <span
    v-else
    class="inline-flex shrink-0 items-center gap-1.5 text-[13px] font-medium text-[#42424B]"
  >
    <span
      class="grid h-5 w-5 place-items-center rounded-md"
      :style="{ backgroundColor: meta.bg, color: meta.color }"
    >
      <CIcon :name="meta.icon" class="h-3.5 w-3.5" />
    </span>
    {{ label }}
  </span>
</template>
