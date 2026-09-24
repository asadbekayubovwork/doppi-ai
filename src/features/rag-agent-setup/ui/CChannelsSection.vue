<script setup lang="ts">
import { ref } from "vue"
import { CChannelIcon, type ChannelKind } from "@/entities/rag-agent"
import { useDismiss } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import { CHANNEL_SETUP } from "../model/channel-setup"
import type { ChannelDraft } from "../model/channel-drafts"
import CChannelCard from "./CChannelCard.vue"
import CSetupSection from "./CSetupSection.vue"

defineProps<{
  channels: ChannelDraft[]
  /** Channels not on the list yet, offered by "Add another channel". */
  available: ChannelKind[]
  icon?: string
  hint?: string
}>()

const emit = defineEmits<{
  toggle: [kind: ChannelKind, enabled: boolean]
  credential: [kind: ChannelKind, key: string, value: string]
  add: [kind: ChannelKind]
}>()

const menu = ref<HTMLElement | null>(null)
const isMenuOpen = ref(false)
useDismiss(menu, () => (isMenuOpen.value = false))

const add = (kind: ChannelKind) => {
  isMenuOpen.value = false
  emit("add", kind)
}
</script>

<template>
  <CSetupSection
    :step="5"
    :icon="icon"
    :title="$t('dashboard.rag.channelsSection.title')"
    :hint="hint ?? $t('dashboard.rag.channelsSection.hint')"
  >
    <template v-if="$slots.aside" #aside><slot name="aside" /></template>
    <div class="space-y-3">
      <CChannelCard
        v-for="channel in channels"
        :key="channel.kind"
        :channel="channel"
        @toggle="emit('toggle', channel.kind, $event)"
        @credential="
          (key, value) => emit('credential', channel.kind, key, value)
        "
      />

      <div v-if="available.length" ref="menu" class="relative">
        <button
          type="button"
          class="flex h-9 w-full items-center justify-center gap-2 rounded-[10px] border border-[#E5E5E1] bg-white text-[13px] font-semibold text-[#15151B] transition hover:bg-[#FAFAF9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BE8]/40"
          aria-haspopup="menu"
          :aria-expanded="isMenuOpen"
          @click="isMenuOpen = !isMenuOpen"
        >
          <CIcon name="plus" class="h-4 w-4" />
          {{ $t("dashboard.rag.channelsSection.add") }}
        </button>
        <Transition name="dropdown">
          <div
            v-if="isMenuOpen"
            role="menu"
            class="absolute inset-x-0 z-10 mt-2 origin-top overflow-hidden rounded-xl border border-[#E5E5E1] bg-white py-1 shadow-[0_16px_40px_rgba(16,17,26,0.14)]"
          >
            <button
              v-for="kind in available"
              :key="kind"
              type="button"
              role="menuitem"
              class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-[#15151B] transition hover:bg-[#FAFAF9]"
              @click="add(kind)"
            >
              <CChannelIcon :channel="kind" />
              {{ $t(CHANNEL_SETUP[kind].title) }}
            </button>
          </div>
        </Transition>
      </div>
    </div>
  </CSetupSection>
</template>
