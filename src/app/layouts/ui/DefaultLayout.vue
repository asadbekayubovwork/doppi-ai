<script setup lang="ts">
import { CBorderGlowLayer } from "@/shared/ui"
import { CHeader, CFooter } from "@/widgets"
</script>

<template>
  <div class="min-h-screen flex flex-col bg-ground">
    <CHeader />
    <main id="main" class="flex-1">
      <slot />
    </main>
    <CFooter />
    <CBorderGlowLayer />
  </div>
</template>
