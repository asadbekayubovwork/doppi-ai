<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { CDashboardHeader } from "@/widgets/dashboard-header"
import { CDashboardSidebar } from "@/widgets/dashboard-sidebar"

const route = useRoute()
const isNavOpen = ref(false)
const main = ref<HTMLElement | null>(null)

// The sidebar is a drawer below `lg`; navigating should close it.
watch(
  () => route.fullPath,
  () => (isNavOpen.value = false)
)

// <main> is the scroller here, not the window, so the router's scrollBehavior
// can't reach it: start each page at the top and follow in-page anchors.
watch(
  () => [route.path, route.hash] as const,
  async ([path, hash], [previousPath]) => {
    await nextTick()
    const anchor = hash
      ? document.getElementById(decodeURIComponent(hash.slice(1)))
      : null
    if (anchor) anchor.scrollIntoView({ behavior: "smooth", block: "start" })
    else if (path !== previousPath) main.value?.scrollTo({ top: 0 })
  }
)
</script>

<template>
  <div
    class="relative flex h-dvh overflow-hidden bg-[#F7F7F8] [&_*]:[scrollbar-color:#D6D6D1_transparent] [&_*]:[scrollbar-width:thin]"
    data-lenis-prevent
  >
    <!-- App shell: the viewport never scrolls, so the sidebar and header stay
         in place and pages can size panels to the space left.
         `data-lenis-prevent` opts out of the landing page's smooth scrolling,
         which cancels wheel events and would otherwise freeze every nested
         scroll area. Scroll containers are `relative` so absolutely positioned
         descendants (`sr-only` labels) stay inside them instead of stretching
         the document, and every scroll area gets a thin, quiet scrollbar. -->
    <CDashboardSidebar :open="isNavOpen" @close="isNavOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <CDashboardHeader @open-nav="isNavOpen = true" />
      <main
        ref="main"
        class="relative min-h-0 flex-1 overflow-y-auto p-4 sm:p-6"
      >
        <slot />
      </main>
    </div>
  </div>
</template>
