<script setup lang="ts">
import CDoppiMark from "./CDoppiMark.vue"

withDefaults(defineProps<{ withWordmark?: boolean }>(), { withWordmark: true })
</script>

<template>
  <span class="inline-flex items-center gap-2.5">
    <CDoppiMark class="h-7 w-9 text-[#8F6BFF] shrink-0" />
    <span
      v-if="withWordmark"
      class="text-lg font-bold tracking-tight text-white whitespace-nowrap"
    >
      Do'ppi<span class="text-[#8F6BFF]">.ai</span>
    </span>
  </span>
</template>
