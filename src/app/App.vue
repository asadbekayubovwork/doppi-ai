<template>
  <RouterView v-slot="{ Component }">
    <Transition mode="out-in" name="layout">
      <div :key="String(detectLayout)">
        <component :is="detectLayout">
          <Transition mode="out-in" :name="pageTransition">
            <Component :is="Component" />
          </Transition>
        </component>
      </div>
    </Transition>
  </RouterView>
  <CToaster />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useLenis } from "@/shared/lib"
import { CToaster } from "@/shared/ui"

import { DashboardLayout, DefaultLayout, EmptyLayout } from "./layouts"

const layouts = {
  DefaultLayout,
  EmptyLayout,
  DashboardLayout,
}

const route = useRoute()

const detectLayout = computed(() => {
  const metaLayout = route.meta.layout as keyof typeof layouts
  return layouts[metaLayout]
})

// The landing's blur reads as a page load; inside the dashboard a short slide
// is what makes navigation feel instant.
const pageTransition = computed(() =>
  route.meta.layout === "DashboardLayout" ? "app-page" : "page"
)

// Initialize Lenis smooth scroll
useLenis()
</script>
