<script setup lang="ts">
import { computed } from "vue"
import { CDoppiMark, CIcon } from "@/shared/ui"

defineProps<{ open?: boolean }>()
defineEmits<{ close: [] }>()

interface NavItem {
  label: string
  to: string
  icon: string
  badge?: number
}

// Two groups, matching the product split: what the workspace runs, and how the
// workspace itself is administered.
const services: NavItem[] = [
  { label: "Universal RAG agent", to: "/app/rag", icon: "library" },
  { label: "Ovozli agent", to: "/app/voice", icon: "audio-lines", badge: 3 },
  { label: "Video generator", to: "/app/video", icon: "clapperboard" },
]

const workspace: NavItem[] = [
  { label: "Sarf va to'lovlar", to: "/app/usage", icon: "bar-chart-3" },
  { label: "API kalitlar", to: "/app/api-keys", icon: "key-round" },
  { label: "Jamoa", to: "/app/team", icon: "users" },
  { label: "Sozlamalar", to: "/app/settings", icon: "settings" },
]

// Placeholder figures until the billing endpoint is wired up.
const balance = { amount: "$248.60", currency: "USD", limit: 400, used: 62 }
const balanceHint = computed(
  () => `$${balance.limit} oylik limitning ${balance.used}% ishlatilgan`
)
</script>

<template>
  <!-- Backdrop for the drawer on small screens. -->
  <Transition name="fade">
    <div
      v-if="open"
      class="fixed inset-0 z-30 bg-black/50 lg:hidden"
      aria-hidden="true"
      @click="$emit('close')"
    />
  </Transition>

  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-[264px] shrink-0 flex-col bg-[#0F0F14] transition-transform duration-300 lg:static lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center justify-between gap-3 px-5 py-5">
      <RouterLink
        to="/app/rag"
        class="inline-flex items-center gap-2.5"
        aria-label="Do'ppi AI ish maydoni"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#6633EE]"
        >
          <CDoppiMark class="h-[18px] w-5 text-white" />
        </span>
        <span class="text-[15px] font-bold tracking-tight text-white">
          Do'ppi AI
        </span>
      </RouterLink>
      <span
        class="rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/60"
      >
        Pro
      </span>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 pb-4">
      <p
        class="px-2 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35"
      >
        Servislar
      </p>
      <ul class="space-y-1">
        <li v-for="item in services" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            active-class="bg-white/[0.09] !text-white"
          >
            <CIcon :name="item.icon" class="h-[18px] w-[18px] shrink-0" />
            <span class="flex-1 truncate">{{ item.label }}</span>
            <span
              v-if="item.badge"
              class="flex h-5 min-w-5 items-center justify-center rounded-md bg-[#6633EE] px-1.5 text-[11px] font-semibold text-white"
            >
              {{ item.badge }}
            </span>
          </RouterLink>
        </li>
      </ul>

      <p
        class="px-2 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/35"
      >
        Ish maydoni
      </p>
      <ul class="space-y-1">
        <li v-for="item in workspace" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
            active-class="bg-white/[0.09] !text-white"
          >
            <CIcon :name="item.icon" class="h-[18px] w-[18px] shrink-0" />
            <span class="flex-1 truncate">{{ item.label }}</span>
          </RouterLink>
        </li>
      </ul>
    </nav>

    <div class="px-3 pb-3">
      <div class="rounded-2xl bg-white/[0.04] p-4">
        <div class="flex items-center justify-between gap-3">
          <span class="text-[13px] text-white/55">Mavjud balans</span>
          <CIcon name="wallet" class="h-4 w-4 text-white/40" />
        </div>
        <p class="mt-1.5 text-[26px] font-bold tracking-tight text-white">
          {{ balance.amount }}
          <span class="ml-1 text-sm font-medium text-white/45">
            {{ balance.currency }}
          </span>
        </p>

        <div
          class="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="img"
          :aria-label="balanceHint"
        >
          <span
            class="block h-full rounded-full bg-[#C0F04A]"
            :style="{ width: `${balance.used}%` }"
          />
        </div>
        <p class="mt-2 text-[11.5px] leading-4 text-white/40">
          {{ balanceHint }}
        </p>

        <button
          type="button"
          class="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#C0F04A] text-[13.5px] font-semibold text-[#12180A] transition hover:bg-[#B3E93A]"
        >
          <CIcon name="plus" class="h-4 w-4" />
          Balansni to'ldirish
        </button>
      </div>
    </div>

    <button
      type="button"
      class="flex items-center gap-3 border-t border-white/[0.07] px-4 py-4 text-left transition hover:bg-white/[0.04]"
    >
      <span
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#6633EE]/25 text-xs font-semibold text-[#c3aaff]"
        aria-hidden="true"
      >
        AK
      </span>
      <span class="block min-w-0 flex-1">
        <span class="block truncate text-[13.5px] font-semibold text-white">
          Akmal Karimov
        </span>
        <span class="block truncate text-xs text-white/40">
          akmal@doppi.ai
        </span>
      </span>
      <CIcon name="chevrons-up-down" class="h-4 w-4 shrink-0 text-white/40" />
    </button>
  </aside>
</template>
