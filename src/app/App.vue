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
  <CClickSparkLayer :color="sparkColor" />
</template>

<script setup lang="ts">
import { RouterView } from "vue-router"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useHead } from "@unhead/vue"
import { useLenis } from "@/shared/lib"
import { CClickSparkLayer, CToaster } from "@/shared/ui"
import { findSeoPage } from "@/shared/config/seoPages"

import {
  AuthLayout,
  DashboardLayout,
  AdminLayout,
  DefaultLayout,
  EmptyLayout,
} from "./layouts"

const layouts = {
  DefaultLayout,
  EmptyLayout,
  DashboardLayout,
  AdminLayout,
  AuthLayout,
}

const route = useRoute()

const detectLayout = computed(() => {
  const metaLayout = route.meta.layout as keyof typeof layouts
  return layouts[metaLayout]
})

// The landing's blur reads as a page load; inside the dashboard and between
// auth pages a short slide is what makes navigation feel instant. Auth pages
// share AuthLayout, so only their right-hand column takes part in it.
const pageTransition = computed(() =>
  route.meta.layout === "DashboardLayout" ||
  route.meta.layout === "AdminLayout" ||
  route.meta.layout === "AuthLayout"
    ? "app-page"
    : "page"
)

// On the landing the sparks take its one accent colour; elsewhere they keep
// the layer's default.
const sparkColor = computed(() =>
  route.meta.layout === "DefaultLayout" ? "#FF4704" : undefined
)

// Only pages listed in SEO_PAGES belong in search results; sign-in, the
// dashboard and the 404 page stay out.
useHead({
  meta: [
    {
      name: "robots",
      content: computed(() =>
        findSeoPage(route.path) ? "index, follow" : "noindex, follow"
      ),
    },
  ],
})

// Initialize Lenis smooth scroll
useLenis()
</script>
