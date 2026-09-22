<script setup lang="ts">
/**
 * The closing band: dark surface, headline on the left, the page's own buttons
 * on the right through the `actions` slot.
 */
defineProps<{
  /** i18n branch holding title and subtitle. */
  base: string
}>()
</script>

<template>
  <section class="section-ground pb-[80px] sm:pb-[120px]">
    <div class="container relative z-10">
      <div
        class="flex flex-col items-start gap-8 rounded-[28px] bg-sand-950 p-8 sm:p-12 lg:flex-row lg:items-center lg:justify-between lg:gap-10 lg:p-[52px]"
        data-aos="fade-up"
        data-aos-duration="900"
      >
        <div class="flex max-w-[640px] flex-col gap-3.5">
          <h2
            class="text-[26px] font-bold leading-[115%] tracking-tight text-white sm:text-[38px]"
          >
            {{ $t(`${base}.title`) }}
          </h2>
          <p class="text-base leading-[165%] text-sand-300">
            {{ $t(`${base}.subtitle`) }}
          </p>
        </div>

        <div class="flex w-full shrink-0 flex-col gap-3 sm:w-auto lg:items-end">
          <slot name="actions" />
        </div>
      </div>
    </div>
  </section>
</template>
