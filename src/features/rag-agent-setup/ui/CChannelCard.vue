<script setup lang="ts">
import { computed } from "vue"
import { CChannelIcon } from "@/entities/rag-agent"
import { CSwitch } from "@/shared/ui"
import { CHANNEL_SETUP } from "../model/channel-setup"
import type { ChannelDraft } from "../model/useAgentSetupForm"
import CCredentialField from "./CCredentialField.vue"

const props = defineProps<{ channel: ChannelDraft }>()

const emit = defineEmits<{
  toggle: [enabled: boolean]
  credential: [key: string, value: string]
}>()

const setup = computed(() => CHANNEL_SETUP[props.channel.kind])
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
        <p class="truncate text-xs text-[#84848E]">{{ setup.caption }}</p>
      </div>
      <CSwitch
        :model-value="channel.enabled"
        :label="`Connect ${setup.title}`"
        @update:model-value="emit('toggle', $event)"
      />
    </header>

    <div v-if="channel.enabled" class="space-y-3 px-3 pb-3">
      <CCredentialField
        v-for="field in setup.fields"
        :key="field.key"
        :field="field"
        :model-value="channel.credentials[field.key]"
        @update:model-value="emit('credential', field.key, $event)"
      />
    </div>
  </article>
</template>
