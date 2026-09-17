<script setup lang="ts">
import CIcon from "./CIcon.vue"

defineProps<{
  icon: string
  title: string
  description?: string
}>()
</script>

<template>
  <section
    class="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#D6D6D1] bg-white px-6 py-14 text-center"
  >
    <span
      class="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#EFECFF] text-[#5B4BE8]"
    >
      <CIcon :name="icon" class="h-6 w-6" />
    </span>
    <h2 class="mt-4 text-base font-semibold text-[#15151B]">{{ title }}</h2>
    <p
      v-if="description"
      class="mt-1.5 max-w-md text-[13px] leading-5 text-[#6A6A74]"
    >
      {{ description }}
    </p>
    <div
      v-if="$slots.default"
      class="mt-5 flex flex-wrap justify-center gap-2.5"
    >
      <slot />
    </div>
  </section>
</template>
