<script setup lang="ts">
import logoUrl from "../assets/brand/logo.svg"
import CDoppiMark from "./CDoppiMark.vue"

withDefaults(defineProps<{ withWordmark?: boolean }>(), { withWordmark: true })

// logo.svg draws its wordmark in white, so the full logo belongs on dark
// surfaces. On a light one, pair CDoppiMark with dark text instead.
</script>

<template>
  <img
    v-if="withWordmark"
    :src="logoUrl"
    alt="Do'ppi AI"
    width="568"
    height="134"
    class="h-8 w-auto shrink-0"
  />
  <CDoppiMark v-else class="h-8 w-8 shrink-0 text-white" />
</template>
