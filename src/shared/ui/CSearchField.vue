<script setup lang="ts">
import CIcon from "./CIcon.vue"

defineProps<{
  placeholder?: string
  /** Accessible name; defaults to the placeholder. */
  label?: string
}>()

const model = defineModel<string>({ default: "" })
</script>

<template>
  <label class="relative block">
    <span class="sr-only">{{ label ?? placeholder }}</span>
    <CIcon
      name="search"
      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84848E]"
    />
    <input
      v-model="model"
      type="search"
      :placeholder="placeholder"
      class="h-9 w-full rounded-[10px] border border-[#E5E5E1] bg-white pl-9 pr-3 text-[13px] text-[#15151B] outline-none transition placeholder:text-[#84848E] focus:border-[#5B4BE8] focus:ring-2 focus:ring-[#5B4BE8]/15"
    />
  </label>
</template>
