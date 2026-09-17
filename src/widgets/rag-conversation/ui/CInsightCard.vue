<script setup lang="ts">
import { useId } from "vue"
import { CIcon } from "@/shared/ui"

defineProps<{ title: string; icon: string }>()

const titleId = useId()
</script>

<template>
  <section
    class="overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white"
    :aria-labelledby="titleId"
  >
    <header
      class="flex items-center justify-between gap-3 border-b border-[#EEEEEA] px-4 py-3"
    >
      <h2 :id="titleId" class="text-sm font-semibold text-[#15151B]">
        {{ title }}
      </h2>
      <CIcon :name="icon" class="h-4 w-4 text-[#84848E]" />
    </header>
    <slot />
  </section>
</template>
