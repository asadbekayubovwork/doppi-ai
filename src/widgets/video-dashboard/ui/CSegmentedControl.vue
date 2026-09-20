<script setup lang="ts" generic="T extends string">
defineProps<{
  options: ReadonlyArray<{ value: T; label: string }>
}>()

const model = defineModel<T>({ required: true })
</script>

<template>
  <div
    class="inline-flex items-center gap-0.5 rounded-[10px] border border-[#E7E5F3] bg-[#F5F4FB] p-0.5"
    role="tablist"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="model === option.value"
      class="h-7 rounded-[8px] px-3 text-[12.5px] font-semibold transition"
      :class="
        model === option.value
          ? 'bg-white text-[#15151B] shadow-[0_1px_2px_rgba(22,22,27,0.08)]'
          : 'text-[#73737D] hover:text-[#15151B]'
      "
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>
