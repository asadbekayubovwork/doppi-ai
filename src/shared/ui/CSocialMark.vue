<script setup lang="ts">
import { computed } from "vue"
import instagramUrl from "../assets/brand/instagram.svg"
import telegramUrl from "../assets/brand/telegram.svg"
import CIcon from "./CIcon.vue"

/**
 * Full-colour social logo, drawn in the network's own brand gradient.
 *
 * Unlike CBrandMark these are multi-stop gradients, so they cannot be reduced
 * to a single `currentColor` path; they ship as SVG files and render as <img>.
 * A network without an official mark here falls back to the CIcon outline, so
 * adding an entry to SOCIALS never leaves an empty slot.
 */
const props = defineProps<{ name: string }>()

const MARKS: Record<string, string> = {
  instagram: instagramUrl,
  telegram: telegramUrl,
}

const src = computed(() => MARKS[props.name])
</script>

<template>
  <img v-if="src" :src="src" alt="" aria-hidden="true" loading="lazy" decoding="async" />
  <CIcon v-else :name="name" />
</template>
