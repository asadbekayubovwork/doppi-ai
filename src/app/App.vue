<template>
  <RouterView v-slot="{ Component }">
    <Transition mode="out-in" name="layout">
      <div :key="String(detectLayout)">
        <component :is="detectLayout">
          <Transition mode="out-in" name="page">
            <Component :is="Component" />
          </Transition>
        </component>
      </div>
    </Transition>
  </RouterView>
</template>

<script setup lang="ts">
import { RouterView } from "vue-router"
import { computed } from "vue"
import { useRoute } from "vue-router"
import { useLenis } from "@/shared/lib"

import { DefaultLayout, EmptyLayout } from "./layouts"

const layouts = {
  DefaultLayout,
  EmptyLayout,
}

const route = useRoute()

const detectLayout = computed(() => {
  const metaLayout = route.meta.layout as keyof typeof layouts
  return layouts[metaLayout]
})

// Initialize Lenis smooth scroll
useLenis()
</script>
