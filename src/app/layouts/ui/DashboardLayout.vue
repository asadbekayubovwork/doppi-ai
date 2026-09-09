<script setup lang="ts">
import { ref, watch } from "vue"
import { useRoute } from "vue-router"
import { CDashboardHeader } from "@/widgets/dashboard-header"
import { CDashboardSidebar } from "@/widgets/dashboard-sidebar"

const route = useRoute()
const isNavOpen = ref(false)

// The sidebar is a drawer below `lg`; navigating should close it.
watch(
  () => route.fullPath,
  () => (isNavOpen.value = false)
)
</script>

<template>
  <div class="flex min-h-screen bg-[#F7F7F8]">
    <CDashboardSidebar :open="isNavOpen" @close="isNavOpen = false" />

    <div class="flex min-w-0 flex-1 flex-col">
      <CDashboardHeader @open-nav="isNavOpen = true" />
      <main class="flex-1 p-4 sm:p-6">
        <slot />
      </main>
    </div>
  </div>
</template>
