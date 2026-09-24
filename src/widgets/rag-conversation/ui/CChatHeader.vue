<script setup lang="ts">
import { computed, ref } from "vue"
import type { ConversationDetail } from "@/entities/rag-agent"
import { formatClockTime, useCountLabel, useDismiss } from "@/shared/lib"
import { CBadge, CIcon, CIconButton } from "@/shared/ui"

const props = defineProps<{ conversation: ConversationDetail }>()

const emit = defineEmits<{ copyLink: []; export: [] }>()

const count = useCountLabel()

const initials = computed(() =>
  props.conversation.customer.name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("")
)

const menu = ref<HTMLElement | null>(null)
const isMenuOpen = ref(false)
useDismiss(menu, () => (isMenuOpen.value = false))

const actions = [
  {
    label: "dashboard.rag.conversation.copyLink",
    icon: "link-2",
    run: () => emit("copyLink"),
  },
  {
    label: "dashboard.rag.conversation.export",
    icon: "download",
    run: () => emit("export"),
  },
]

const choose = (run: () => void) => {
  isMenuOpen.value = false
  run()
}
</script>

<template>
  <header class="flex items-center gap-3 border-b border-[#EEEEEA] px-5 py-3">
    <span
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EFECFF] text-[13px] font-semibold text-[#5B4BE8]"
      aria-hidden="true"
    >
      {{ initials }}
    </span>
    <div class="min-w-0 flex-1">
      <h2 class="truncate text-sm font-semibold text-[#15151B]">
        {{ conversation.customer.name }}
      </h2>
      <p class="truncate text-xs text-[#84848E]">
        {{
          $t("dashboard.rag.conversation.started", {
            contact: conversation.customer.contact,
            time: formatClockTime(conversation.startedAt),
          })
        }}
      </p>
    </div>

    <CBadge tone="outline" icon="messages-square" class="hidden sm:inline-flex">
      {{ count("dashboard.plural.messages", conversation.messageCount) }}
    </CBadge>

    <div ref="menu" class="relative">
      <CIconButton
        icon="ellipsis"
        :label="$t('dashboard.rag.conversation.actions')"
        aria-haspopup="menu"
        :aria-expanded="isMenuOpen"
        @click="isMenuOpen = !isMenuOpen"
      />
      <Transition name="dropdown">
        <div
          v-if="isMenuOpen"
          role="menu"
          class="absolute right-0 z-20 mt-2 w-48 origin-top-right overflow-hidden rounded-xl border border-[#E5E5E1] bg-white py-1 shadow-[0_16px_40px_rgba(16,17,26,0.14)]"
        >
          <button
            v-for="action in actions"
            :key="action.label"
            type="button"
            role="menuitem"
            class="flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-[13px] text-[#15151B] transition hover:bg-[#FAFAF9]"
            @click="choose(action.run)"
          >
            <CIcon :name="action.icon" class="h-4 w-4 text-[#84848E]" />
            {{ $t(action.label) }}
          </button>
        </div>
      </Transition>
    </div>
  </header>
</template>
