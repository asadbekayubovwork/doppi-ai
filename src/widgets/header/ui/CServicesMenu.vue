<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { CIcon } from "@/shared/ui"
import { SERVICE_NAV } from "@/shared/config/services"

const route = useRoute()
const root = ref<HTMLElement | null>(null)
const isOpen = ref(false)

const isActive = computed(() => SERVICE_NAV.some((item) => item.to === route.path))

watch(() => route.fullPath, () => (isOpen.value = false))

// Keyboard users tab out of the panel; close once focus leaves the menu.
const handleFocusOut = (event: FocusEvent) => {
  if (!root.value?.contains(event.relatedTarget as Node | null)) isOpen.value = false
}
</script>

<template>
  <div
    ref="root"
    class="relative"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
    @focusout="handleFocusOut"
    @keydown.escape="isOpen = false"
  >
    <button
      type="button"
      class="inline-flex items-center gap-1 text-sm text-white/75 transition-200 hover:text-white"
      :class="{ 'text-[#8F6BFF]': isActive }"
      :aria-expanded="isOpen"
      aria-controls="services-menu"
      @click="isOpen = !isOpen"
    >
      {{ $t("services.navLabel") }}
      <CIcon
        name="chevron-down"
        class="h-4 w-4 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- v-show rather than v-if: crawlers only follow links that are in the DOM. -->
    <div
      v-show="isOpen"
      id="services-menu"
      class="absolute left-1/2 top-full z-50 w-[340px] -translate-x-1/2 pt-3"
    >
      <ul class="rounded-2xl border border-white/10 bg-ground/95 p-2 shadow-2xl backdrop-blur-2xl">
        <li v-for="item in SERVICE_NAV" :key="item.key">
          <RouterLink
            :to="item.to"
            class="flex items-start gap-3 rounded-xl p-3 transition-colors hover:bg-white/5"
          >
            <span
              class="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#6633EE]/15 text-[#B9A2FF]"
            >
              <CIcon :name="item.icon" class="h-5 w-5" />
            </span>
            <span class="flex flex-col">
              <span class="text-sm font-medium text-white">
                {{ $t(`services.${item.key}.name`) }}
              </span>
              <span class="mt-0.5 text-xs leading-relaxed text-[#A3A3A3]">
                {{ $t(`services.${item.key}.navDesc`) }}
              </span>
            </span>
          </RouterLink>
        </li>
      </ul>
    </div>
  </div>
</template>
