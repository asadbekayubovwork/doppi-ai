<script setup lang="ts">
import { computed } from "vue"
import { CIcon, CLogo } from "@/shared/ui"
import { useAuthStore } from "@/features/auth"
import { SERVICES, WORKSPACE } from "../model/navigation"
import CSidebarNavItem from "./CSidebarNavItem.vue"

defineProps<{ open?: boolean }>()
defineEmits<{ close: [] }>()

const auth = useAuthStore()

// Placeholder figures until the billing endpoint is wired up.
const balance = { amount: "$248.60", currency: "USD", limit: 400, used: 62 }
const balanceHint = computed(
  () => `$${balance.limit} oylik limitning ${balance.used}% ishlatilgan`
)
const userName = computed(() => {
  const name =
    `${auth.user?.first_name || ""} ${auth.user?.last_name || ""}`.trim()
  return name || auth.user?.email || "Foydalanuvchi"
})
const userEmail = computed(() => auth.user?.email || "")
const userInitials = computed(
  () =>
    userName.value
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word[0]?.toUpperCase() || "")
      .join("") || "??"
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
    class="fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r border-white/[0.04] bg-[#111116] transition-transform duration-300 lg:static lg:h-full lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div
      class="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-5"
    >
      <RouterLink
        to="/app/rag"
        class="inline-flex items-center"
        aria-label="Do'ppi AI ish maydoni"
      >
        <CLogo />
      </RouterLink>
      <span
        class="rounded-md bg-[#292832] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9E9BAA]"
      >
        Pro
      </span>
    </div>

    <nav class="flex-1 overflow-y-auto px-3 pb-4">
      <p
        class="px-2 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6D6B77]"
      >
        Services
      </p>
      <ul class="space-y-1">
        <CSidebarNavItem v-for="item in SERVICES" :key="item.to" :item="item" />
      </ul>

      <p
        class="px-2 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6D6B77]"
      >
        Workspace
      </p>
      <ul class="space-y-1">
        <CSidebarNavItem
          v-for="item in WORKSPACE"
          :key="item.to"
          :item="item"
        />
      </ul>
    </nav>

    <div class="px-4 pb-3">
      <div class="rounded-xl border border-white/[0.09] bg-[#1C1C23] p-3">
        <div class="flex items-center justify-between gap-3">
          <span class="text-[13px] text-[#A09EAA]">Available balance</span>
          <CIcon name="wallet" class="h-4 w-4 text-white/40" />
        </div>
        <p class="mt-1 text-2xl font-bold tracking-tight text-white">
          {{ balance.amount }}
          <span class="ml-1 text-xs font-medium text-white/45">
            {{ balance.currency }}
          </span>
        </p>

        <div
          class="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
          role="img"
          :aria-label="balanceHint"
        >
          <span
            class="block h-full rounded-full bg-[#C0F04A]"
            :style="{ width: `${balance.used}%` }"
          />
        </div>
        <p class="mt-1.5 text-[11.5px] leading-4 text-[#8D8B98]">
          {{ balance.used }}% of ${{ balance.limit }} monthly limit used
        </p>

        <button
          type="button"
          class="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#C9F354] text-[13px] font-bold text-[#1A1A13] transition hover:bg-[#BCE943]"
        >
          <CIcon name="plus" class="h-4 w-4" />
          Top up balance
        </button>
      </div>
    </div>

    <button
      type="button"
      class="flex h-[74px] items-center gap-3 border-t border-white/[0.08] px-5 text-left transition hover:bg-white/[0.04]"
    >
      <span
        class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4A416C] text-sm font-bold text-[#B8AAFF]"
        aria-hidden="true"
      >
        {{ userInitials }}
      </span>
      <span class="block min-w-0 flex-1">
        <span class="block truncate text-[13.5px] font-semibold text-white">
          {{ userName }}
        </span>
        <span class="block truncate text-xs text-white/40">
          {{ userEmail }}
        </span>
      </span>
      <CIcon name="chevrons-up-down" class="h-4 w-4 shrink-0 text-white/40" />
    </button>
  </aside>
</template>
