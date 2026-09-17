<script setup lang="ts">
import { CSkeleton } from "@/shared/ui"
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5"
    aria-busy="true"
    aria-label="Loading agent"
  >
    <div class="flex items-center gap-4 border-b border-[#EEEEEA] pb-5">
      <CSkeleton class="h-12 w-12 rounded-[14px]" />
      <div class="flex-1 space-y-2.5">
        <CSkeleton class="h-4 w-56" />
        <CSkeleton class="h-3.5 w-96 max-w-full" />
      </div>
    </div>
    <div class="grid grid-cols-2 gap-5 pt-5 sm:grid-cols-3 lg:grid-cols-5">
      <div v-for="n in 5" :key="n" class="space-y-2.5">
        <CSkeleton class="h-3 w-24" />
        <CSkeleton class="h-6 w-20" />
      </div>
    </div>
  </section>
</template>
