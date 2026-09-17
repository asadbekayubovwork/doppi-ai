<script setup lang="ts">
defineProps<{
  /** Accessible name for the switch. */
  label: string
  disabled?: boolean
}>()

const checked = defineModel<boolean>({ default: false })
</script>

<template>
  <button
    type="button"
    role="switch"
    class="relative inline-flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BE8]/40 disabled:cursor-not-allowed disabled:opacity-50"
    :class="checked ? 'bg-[#5B4BE8]' : 'bg-[#E2E2DE]'"
    :aria-checked="checked"
    :aria-label="label"
    :disabled="disabled"
    @click="checked = !checked"
  >
    <span
      class="h-5 w-5 rounded-full bg-white shadow-[0_1px_2px_rgba(21,21,27,0.2)] transition-transform"
      :class="checked ? 'translate-x-4' : 'translate-x-0'"
      aria-hidden="true"
    />
  </button>
</template>
