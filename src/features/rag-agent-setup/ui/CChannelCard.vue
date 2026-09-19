<script setup lang="ts">
import { computed } from "vue"
import { CChannelIcon } from "@/entities/rag-agent"
import { CSwitch } from "@/shared/ui"
import { CHANNEL_SETUP } from "../model/channel-setup"
import type { ChannelDraft } from "../model/channel-drafts"
import CCredentialField from "./CCredentialField.vue"

const props = defineProps<{ channel: ChannelDraft }>()

const emit = defineEmits<{
  toggle: [enabled: boolean]
  credential: [key: string, value: string]
}>()

const setup = computed(() => CHANNEL_SETUP[props.channel.kind])

const caption = computed(() => {
  const { connected, enabled } = props.channel
  if (!connected) return setup.value.caption
  return `${setup.value.caption} · ${enabled ? "connected" : "disconnects on save"}`
})
</script>

<template>
  <article
    class="rounded-xl border transition-colors"
    :class="
      channel.enabled
        ? 'border-[#E5E5E1] bg-white'
        : 'border-[#EEEEEA] bg-[#FAFAF9]'
    "
  >
    <header class="flex items-center gap-3 p-3">
      <CChannelIcon :channel="channel.kind" framed />
      <div class="min-w-0 flex-1">
        <h4 class="truncate text-[13.5px] font-semibold text-[#15151B]">
          {{ setup.title }}
        </h4>
        <p
          class="truncate text-xs"
          :class="
            channel.connected && !channel.enabled
              ? 'text-[#B45309]'
              : 'text-[#84848E]'
          "
        >
          {{ caption }}
        </p>
      </div>
      <CSwitch
        :model-value="channel.enabled"
        :label="`Connect ${setup.title}`"
        @update:model-value="emit('toggle', $event)"
      />
    </header>

    <div v-if="channel.enabled" class="space-y-3 px-3 pb-3">
      <!-- Saved credentials never come back, so a connected channel starts
           empty and only new values replace them. -->
      <CCredentialField
        v-for="field in setup.fields"
        :key="field.key"
        :field="field"
        :placeholder="channel.connected ? 'Saved · type to replace' : undefined"
        :model-value="channel.credentials[field.key]"
        @update:model-value="emit('credential', field.key, $event)"
      />
    </div>
  </article>
</template>
