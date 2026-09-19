<script setup lang="ts">
import { computed } from "vue"
import logoUrl from "../assets/brand/logo.svg"
import logoDarkUrl from "../assets/brand/logo-dark.svg"
import CDoppiMark from "./CDoppiMark.vue"

const props = withDefaults(
  defineProps<{
    withWordmark?: boolean
    /** The surface the logo sits on: a dark one takes the white-ink logo. */
    surface?: "dark" | "light"
  }>(),
  { withWordmark: true, surface: "dark" }
)

// logo.svg draws its wordmark in white; logo-dark.svg is the same file inked
// in sand-950 for light surfaces such as the landing.
const src = computed(() => (props.surface === "light" ? logoDarkUrl : logoUrl))
</script>

<template>
  <img
    v-if="withWordmark"
    :src="src"
    alt="Do'ppi AI"
    width="568"
    height="134"
    class="h-8 w-auto shrink-0"
  />
  <CDoppiMark
    v-else
    class="h-8 w-8 shrink-0"
    :class="surface === 'light' ? 'text-sand-950' : 'text-white'"
  />
</template>
