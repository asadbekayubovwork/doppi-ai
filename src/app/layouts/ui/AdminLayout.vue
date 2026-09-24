<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import {
  adminTabDetails,
  adminTabFromQuery,
} from "@/features/platform-admin/model/navigation"
import { CIcon } from "@/shared/ui"
import CAdminSidebar from "@/widgets/admin-sidebar/ui/CAdminSidebar.vue"

const route = useRoute()
const menuOpen = ref(false)
const main = ref<HTMLElement | null>(null)
const page = computed(() => adminTabDetails(adminTabFromQuery(route.query.tab)))
watch(
  () => route.fullPath,
  () => {
    menuOpen.value = false
    if (main.value) main.value.scrollTop = 0
  }
)
</script>

<template>
  <div class="flex h-dvh overflow-hidden bg-[#F7F7F9]" data-lenis-prevent>
    <CAdminSidebar :open="menuOpen" @close="menuOpen = false" />
    <div class="flex min-w-0 flex-1 flex-col">
      <header
        class="flex min-h-[72px] items-center justify-between gap-3 border-b border-[#E8E8EC] bg-white px-4 sm:px-7"
      >
        <div class="flex min-w-0 items-center gap-3">
          <button
            type="button"
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E5E5EA] text-[#444450] lg:hidden"
            aria-label="Admin menyusini ochish"
            :aria-expanded="menuOpen"
            @click="menuOpen = true"
          >
            <CIcon name="layout-grid" class="h-5 w-5" />
          </button>
          <div class="min-w-0">
            <p
              class="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8B8B96]"
            >
              Super Admin
            </p>
            <p class="truncate text-base font-bold text-[#24242C]">
              {{ page.title }}
            </p>
          </div>
        </div>
        <span
          class="hidden items-center gap-2 rounded-full border border-[#E9E5F4] bg-[#F7F5FC] px-3 py-1.5 text-xs font-semibold text-[#6558B4] sm:flex"
        >
          <CIcon name="shield-check" class="h-4 w-4" /> Platforma boshqaruvi
        </span>
      </header>
      <main
        ref="main"
        class="min-h-0 flex-1 overflow-y-auto px-4 py-6 sm:px-7 sm:py-8"
      >
        <div class="mx-auto w-full max-w-[1480px]"><slot /></div>
      </main>
    </div>
  </div>
</template>
