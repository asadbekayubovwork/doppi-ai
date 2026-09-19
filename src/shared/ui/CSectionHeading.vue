<script setup lang="ts">
withDefaults(
  defineProps<{
    eyebrow?: string
    title?: string
    subtitle?: string
    align?: "center" | "left"
  }>(),
  { align: "center" }
)
</script>

<template>
  <div
    class="flex flex-col gap-4"
    :class="align === 'center' ? 'mx-auto max-w-[720px] items-center text-center' : 'items-start text-left'"
  >
    <span
      v-if="eyebrow"
      class="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-sand-500"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <span class="h-px w-6 bg-signal" aria-hidden="true" />
      {{ eyebrow }}
    </span>

    <h2
      v-if="title"
      class="text-3xl sm:text-4xl md:text-[42px] font-bold leading-[120%] tracking-tight text-sand-950"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="100"
    >
      <slot name="title">{{ title }}</slot>
    </h2>

    <p
      v-if="subtitle"
      class="max-w-[640px] text-base sm:text-lg leading-[150%] text-sand-500"
      data-aos="fade-up"
      data-aos-duration="1000"
      data-aos-delay="200"
    >
      {{ subtitle }}
    </p>
  </div>
</template>
