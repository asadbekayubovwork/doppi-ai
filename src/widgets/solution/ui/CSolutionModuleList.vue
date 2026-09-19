<script setup lang="ts">
import { CDoppiMark, CIcon } from "@/shared/ui"
import type { SolutionModule } from "../model/types"

defineProps<{
  modules: SolutionModule[]
  current: number | null
}>()
</script>

<template>
  <div class="mt-12 lg:hidden">
    <div
      class="mx-auto flex w-fit items-center gap-3 rounded-2xl border border-sand-950 bg-sand-950 px-5 py-3"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <CDoppiMark class="h-7 w-7 shrink-0 text-white" />
      <span class="text-sm font-bold tracking-tight text-white">
        {{ $t("solution.centerLabel") }}
      </span>
    </div>

    <ul class="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
      <!-- AOS owns the <li>; the card sits inside so its hover transition survives. -->
      <li
        v-for="(module, i) in modules"
        :key="i"
        data-aos="fade-up"
        data-aos-duration="800"
        :data-aos-delay="100 + i * 60"
      >
        <div
          class="surface-card flex h-full items-center gap-3 rounded-2xl px-4 py-3"
          :class="{ 'is-lit': current === i }"
        >
          <span
            class="grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors duration-300"
            :class="current === i ? 'bg-sand-950 text-white' : 'bg-sand-100 text-sand-950'"
          >
            <CIcon :name="module.icon" class="h-5 w-5" />
          </span>
          <span class="text-sm font-medium text-sand-950">{{
            module.label
          }}</span>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
/* The highlight walks the cards too. */
.surface-card.is-lit {
  border-color: rgba(52, 80, 140, 0.6);
  box-shadow: 0 18px 40px -20px rgba(52, 80, 140, 0.45);
}
</style>
