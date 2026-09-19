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
  <CClickSparkLayer />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useHead } from "@unhead/vue"
import { useLenis } from "@/shared/lib"
import { CClickSparkLayer, CToaster } from "@/shared/ui"
import { findSeoPage } from "@/shared/config/seoPages"

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

// Only pages listed in SEO_PAGES belong in search results; sign-in, the
// dashboard and the 404 page stay out.
useHead({
  meta: [
    {
      name: "robots",
      content: computed(() => (findSeoPage(route.path) ? "index, follow" : "noindex, follow")),
    },
  ],
})

// Initialize Lenis smooth scroll
useLenis()
</script>
