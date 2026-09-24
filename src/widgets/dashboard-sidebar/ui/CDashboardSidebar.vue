<script setup lang="ts">
import { computed, ref, watch, ref } from "vue"
import { useAuthStore } from "@/features/auth"
import { useBillingStore } from "@/features/billing"
import { platformAdminApi } from "@/features/platform-admin"
import { CIcon, CLogo } from "@/shared/ui"
import { HOME, SERVICES, WORKSPACE } from "../model/navigation"
import CSidebarNavItem from "./CSidebarNavItem.vue"
import CTopUpModal from "./CTopUpModal.vue"

defineProps<{ open?: boolean }>()
defineEmits<{ close: [] }>()

const { t } = useI18n()

// Placeholder figures until the billing endpoint is wired up.
const balance = { amount: "$248.60", currency: "USD", limit: 400, used: 62 }
const balanceUsed = computed(() =>
  t("dashboard.balance.used", { limit: balance.limit, used: balance.used })
)

// Until payments are wired up, topping up means picking a plan.
const topUpOpen = ref(false)
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
        to="/app"
        class="inline-flex items-center"
        :aria-label="$t('dashboard.workspaceLabel')"
      >
        <CLogo />
      </RouterLink>
      <span
        class="rounded-md bg-[#292832] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-[#9E9BAA]"
      >
        {{ wallet?.tier === "pro" ? "Pro" : "Free" }}
      </span>
    </div>

    <nav class="sidebar-scroll flex-1 overflow-y-auto px-3 pb-4">
      <ul class="pt-3">
        <CSidebarNavItem :item="HOME" />
      </ul>

      <p
        class="px-2 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6D6B77]"
      >
        {{ $t("dashboard.nav.services") }}
      </p>
      <ul class="space-y-1">
        <CSidebarNavItem v-for="item in SERVICES" :key="item.to" :item="item" />
      </ul>
      <ul v-if="isAdmin" class="mt-2 space-y-1">
        <CSidebarNavItem
          :item="{
            labelKey: 'dashboard.nav.platformAdmin',
            to: '/app/admin',
            icon: 'shield-check',
          }"
        />
      </ul>

      <p
        class="px-2 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6D6B77]"
      >
        {{ $t("dashboard.nav.workspace") }}
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
          <span class="text-[13px] text-[#A09EAA]">
            {{ $t("dashboard.balance.available") }}
          </span>
          <CIcon name="wallet" class="h-4 w-4 text-white/40" />
        </div>
        <p class="mt-1 text-2xl font-bold tracking-tight text-white">
          {{
            wallet?.available?.toLocaleString("uz-UZ") ??
            (billing.loading ? "…" : "—")
          }}
          <span class="ml-1 text-xs font-medium text-white/45">{{
            $t("dashboard.balance.creditUnit")
          }}</span>
        </p>
        <p
          v-if="promoExpiry"
          class="mt-1.5 text-[11.5px] leading-4 text-[#8D8B98]"
        >
          {{ $t("dashboard.balance.bonusExpiry", { date: promoExpiry }) }}
        </p>
        <p v-if="billing.error" class="mt-1.5 text-[11.5px] text-amber-300">
          {{ $t("dashboard.balance.loadError") }}
        </p>

        <RouterLink
          to="/app/usage"
          class="mt-2.5 flex h-9 w-full items-center justify-center gap-2 rounded-lg bg-[#C9F354] text-[13px] font-bold text-[#1A1A13] transition hover:bg-[#BCE943]"
          aria-haspopup="dialog"
          @click="topUpOpen = true"
        >
          <CIcon name="wallet" class="h-4 w-4" />
          {{ $t("dashboard.balance.details") }}
        </RouterLink>
      </div>
    </div>

    <CTopUpModal v-model:open="topUpOpen" />
  </aside>
</template>

<style scoped>
/* The layout gives every scroll area a light scrollbar meant for the page
   background; on the dark sidebar it needs a dim thumb that brightens on hover. */
.sidebar-scroll {
  scrollbar-width: thin;
  scrollbar-color: rgb(255 255 255 / 0.1) transparent;
  transition: scrollbar-color 0.2s;
}

.sidebar-scroll:hover {
  scrollbar-color: rgb(255 255 255 / 0.22) transparent;
}

/* Chromium ignores ::-webkit-scrollbar once the standard properties are set,
   and those draw arrow buttons on Windows, so reset them where the pseudo
   elements are available and style the bar directly. */
@supports selector(::-webkit-scrollbar) {
  .sidebar-scroll,
  .sidebar-scroll:hover {
    scrollbar-width: auto;
    scrollbar-color: auto;
  }

  .sidebar-scroll::-webkit-scrollbar {
    width: 10px;
  }

  .sidebar-scroll::-webkit-scrollbar-track,
  .sidebar-scroll::-webkit-scrollbar-corner {
    background: transparent;
  }

  .sidebar-scroll::-webkit-scrollbar-button {
    display: none;
  }

  .sidebar-scroll::-webkit-scrollbar-thumb {
    border: 3px solid transparent;
    border-radius: 9999px;
    background: rgb(255 255 255 / 0.1) padding-box;
  }

  .sidebar-scroll:hover::-webkit-scrollbar-thumb {
    background-color: rgb(255 255 255 / 0.22);
  }

  .sidebar-scroll::-webkit-scrollbar-thumb:active {
    background-color: rgb(255 255 255 / 0.32);
  }
}
</style>
