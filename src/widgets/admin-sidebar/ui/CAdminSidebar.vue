<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useAuthStore } from "@/features/auth"
import {
  ADMIN_NAV,
  adminTabFromQuery,
} from "@/features/platform-admin/model/navigation"
import { CIcon, CLogo } from "@/shared/ui"

defineProps<{ open: boolean }>()
const emit = defineEmits<{ close: [] }>()
const route = useRoute()
const auth = useAuthStore()
const activeTab = computed(() => adminTabFromQuery(route.query.tab))
</script>

<template>
  <div
    v-if="open"
    class="fixed inset-0 z-30 bg-black/55 lg:hidden"
    aria-hidden="true"
    @click="emit('close')"
  />
  <aside
    class="fixed inset-y-0 left-0 z-40 flex w-[272px] shrink-0 flex-col border-r border-white/[0.06] bg-[#17171E] text-white transition-transform duration-200 lg:static lg:h-full lg:translate-x-0"
    :class="open ? 'translate-x-0' : '-translate-x-full admin-sidebar-closed'"
    aria-label="Super Admin navigatsiyasi"
    @keydown.esc="emit('close')"
  >
    <div
      class="flex items-start justify-between border-b border-white/[0.09] px-5 pb-5 pt-6"
    >
      <div>
        <RouterLink
          to="/admin"
          aria-label="Super Admin bosh sahifa"
          @click="emit('close')"
        >
          <CLogo />
        </RouterLink>
        <span
          class="mt-4 inline-flex items-center gap-1.5 rounded-full border border-[#9186DB]/30 bg-[#6F62BD]/15 px-2.5 py-1 text-[11px] font-bold tracking-[0.08em] text-[#D6D0FF]"
        >
          <CIcon name="shield-check" class="h-3.5 w-3.5" /> SUPER ADMIN
        </span>
      </div>
      <button
        type="button"
        class="min-h-11 min-w-11 rounded-lg text-sm text-[#D5D3E0] hover:bg-white/10 lg:hidden"
        aria-label="Menyuni yopish"
        @click="emit('close')"
      >
        Yopish
      </button>
    </div>

    <nav
      class="min-h-0 flex-1 overflow-y-auto px-3 py-5"
      aria-label="Admin bo‘limlari"
    >
      <div v-for="section in ADMIN_NAV" :key="section.label" class="mb-6">
        <p
          class="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#888594]"
        >
          {{ section.label }}
        </p>
        <ul class="space-y-1">
          <li v-for="item in section.items" :key="item.key">
            <RouterLink
              :to="
                item.key === 'overview'
                  ? '/admin'
                  : { path: '/admin', query: { tab: item.key } }
              "
              :aria-current="activeTab === item.key ? 'page' : undefined"
              class="flex min-h-12 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#BDB5F7]"
              :class="
                activeTab === item.key
                  ? 'bg-[#343044] text-white'
                  : 'text-[#B9B7C3] hover:bg-white/[0.07] hover:text-white'
              "
              @click="emit('close')"
            >
              <CIcon :name="item.icon" class="h-[18px] w-[18px] shrink-0" />
              <span>{{ item.title }}</span>
              <span
                v-if="activeTab === item.key"
                class="ml-auto h-1.5 w-1.5 rounded-full bg-[#BDB5F7]"
                aria-hidden="true"
              />
            </RouterLink>
          </li>
        </ul>
      </div>
    </nav>

    <div class="border-t border-white/[0.09] p-4">
      <RouterLink
        to="/app"
        class="flex min-h-11 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-[#D7D4E0] transition-colors hover:bg-white/[0.07] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#BDB5F7]"
      >
        <CIcon name="arrow-left" class="h-4 w-4" /> Ish joyiga qaytish
      </RouterLink>
      <p
        class="mt-3 truncate px-3 text-xs text-[#888594]"
        :title="auth.user?.email ?? ''"
      >
        {{ auth.user?.email }}
      </p>
    </div>
  </aside>
</template>

<style scoped>
@media (max-width: 1023px) {
  .admin-sidebar-closed {
    visibility: hidden;
    pointer-events: none;
  }
}
</style>
