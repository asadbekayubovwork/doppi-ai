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
      class="mx-auto flex w-fit items-center gap-3 rounded-2xl border border-[#6633EE]/50 bg-[#160A2E] px-5 py-3"
      data-aos="fade-up"
      data-aos-duration="800"
    >
      <CDoppiMark class="h-7 w-7 shrink-0 text-[#8F6BFF]" />
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
            :class="current === i ? 'bg-[#6633EE]/35' : 'bg-[#6633EE]/15'"
          >
            <CIcon :name="module.icon" class="h-5 w-5 text-[#B9A2FF]" />
          </span>
          <span class="text-sm font-medium text-white">{{
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
  border-color: rgba(102, 51, 238, 0.55);
  background: rgba(102, 51, 238, 0.08);
  box-shadow: 0 18px 40px -18px rgba(102, 51, 238, 0.55);
}
</style>
