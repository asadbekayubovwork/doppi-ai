<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { CDoppiMark, CIcon } from "@/shared/ui"
import { useAuthStore } from "@/features/auth"

defineProps<{ open?: boolean }>()
defineEmits<{ close: [] }>()

const route = useRoute()
const auth = useAuthStore()
const isVideoMenuOpen = ref(route.path.startsWith("/app/video"))

watch(
  () => route.path,
  (path) => {
    if (path.startsWith("/app/video")) isVideoMenuOpen.value = true
  }
)

interface NavItem {
  label: string
  to: string
  icon: string
  badge?: number
}

// Two groups, matching the product split: what the workspace runs, and how the
// workspace itself is administered.
const services: NavItem[] = [
  { label: "Universal RAG Agent", to: "/app/rag", icon: "library" },
  { label: "Voice Agent", to: "/app/voice", icon: "audio-lines", badge: 3 },
  { label: "Video Generator", to: "/app/video", icon: "clapperboard" },
]

const workspace: NavItem[] = [
  { label: "Usage & Billing", to: "/app/usage", icon: "bar-chart-3" },
  { label: "Team", to: "/app/team", icon: "users" },
  { label: "Settings", to: "/app/settings", icon: "settings" },
]

const isActive = (to: string) =>
  route.path === to || (to === "/app/video" && route.path.startsWith("/app/video"))

const toggleVideoMenu = (event: MouseEvent) => {
  if (route.path.startsWith("/app/video")) {
    event.preventDefault()
    isVideoMenuOpen.value = !isVideoMenuOpen.value
  } else {
    isVideoMenuOpen.value = true
  }
}

// Placeholder figures until the billing endpoint is wired up.
const balance = { amount: "$248.60", currency: "USD", limit: 400, used: 62 }
const balanceHint = computed(
  () => `$${balance.limit} oylik limitning ${balance.used}% ishlatilgan`
)
const userName = computed(() => {
  const name = `${auth.user?.first_name || ""} ${auth.user?.last_name || ""}`.trim()
  return name || auth.user?.email || "Foydalanuvchi"
})
const userEmail = computed(() => auth.user?.email || "")
const userInitials = computed(() =>
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
    class="fixed inset-y-0 left-0 z-40 flex w-[280px] shrink-0 flex-col border-r border-white/[0.04] bg-[#111116] transition-transform duration-300 lg:static lg:h-screen lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full'"
  >
    <div class="flex items-center justify-between gap-3 border-b border-white/[0.08] px-5 py-5">
      <RouterLink
        to="/app/rag"
        class="inline-flex items-center gap-2.5"
        aria-label="Do'ppi AI ish maydoni"
      >
        <span
          class="flex h-8 w-8 items-center justify-center rounded-[10px] bg-[#6046E8]"
        >
          <CDoppiMark class="h-[18px] w-5 text-white" />
        </span>
        <span class="text-[15px] font-bold tracking-tight text-white">
          Do'ppi AI
        </span>
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
        <li v-for="item in services" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#9795A2] transition hover:bg-white/[0.06] hover:text-white"
            :class="isActive(item.to) ? 'bg-[#28272F] !text-[#F5F5F7]' : ''"
            :aria-expanded="item.to === '/app/video' ? isVideoMenuOpen : undefined"
            @click="item.to === '/app/video' && toggleVideoMenu($event)"
          >
            <CIcon
              :name="item.icon"
              class="h-[18px] w-[18px] shrink-0"
              :class="isActive(item.to) ? 'text-[#B9A7FF]' : ''"
            />
            <span class="flex-1 truncate">{{ item.label }}</span>
            <CIcon
              v-if="item.to === '/app/video'"
              name="chevron-down"
              class="h-4 w-4 shrink-0 transition-transform duration-200"
              :class="isVideoMenuOpen ? 'rotate-180' : ''"
            />
            <span
              v-if="item.badge"
              class="flex h-6 min-w-6 items-center justify-center rounded-lg bg-[#6046E8] px-1.5 text-xs font-bold text-white"
            >
              {{ item.badge }}
            </span>
          </RouterLink>
        </li>
      </ul>

      <Transition
        enter-active-class="overflow-hidden transition-all duration-200 ease-out"
        enter-from-class="max-h-0 -translate-y-1 opacity-0"
        enter-to-class="max-h-24 translate-y-0 opacity-100"
        leave-active-class="overflow-hidden transition-all duration-150 ease-in"
        leave-from-class="max-h-24 translate-y-0 opacity-100"
        leave-to-class="max-h-0 -translate-y-1 opacity-0"
      >
        <ul v-if="isVideoMenuOpen" class="mt-1 max-h-24 space-y-1 overflow-hidden pl-7">
          <li>
            <RouterLink
              to="/app/video#plans"
              class="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#9795A2] transition hover:bg-white/[0.06] hover:text-white"
            >
              <CIcon name="calendar-days" class="h-[18px] w-[18px] shrink-0" />
              <span class="flex-1">Plans</span>
              <span class="flex h-6 min-w-6 items-center justify-center rounded-full bg-[#28272F] px-1.5 text-xs font-semibold text-[#9896A2]">3</span>
            </RouterLink>
          </li>
          <li>
            <RouterLink
              to="/app/video#new-video"
              class="flex h-9 items-center gap-3 rounded-lg px-3 text-sm font-medium text-[#9795A2] transition hover:bg-white/[0.06] hover:text-white"
            >
              <CIcon name="sparkles" class="h-[18px] w-[18px] shrink-0" />
              <span>New video</span>
            </RouterLink>
          </li>
        </ul>
      </Transition>

      <p
        class="px-2 pb-2 pt-6 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#6D6B77]"
      >
        Workspace
      </p>
      <ul class="space-y-1">
        <li v-for="item in workspace" :key="item.to">
          <RouterLink
            :to="item.to"
            class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[#9795A2] transition hover:bg-white/[0.06] hover:text-white"
            :class="isActive(item.to) ? 'bg-[#28272F] !text-[#F5F5F7]' : ''"
          >
            <CIcon :name="item.icon" class="h-[18px] w-[18px] shrink-0" />
            <span class="flex-1 truncate">{{ item.label }}</span>
          </RouterLink>
        </li>
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
