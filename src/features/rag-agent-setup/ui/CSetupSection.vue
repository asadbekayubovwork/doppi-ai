<script setup lang="ts">
import { useId } from "vue"
import { CIcon } from "@/shared/ui"

defineProps<{
  /** Position in the setup flow, drawn as a numbered badge. */
  step?: number
  /** Drawn in the badge instead of the step, where the order doesn't matter. */
  icon?: string
  title: string
  hint?: string
}>()

const titleId = useId()
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white"
    :aria-labelledby="titleId"
  >
    <header
      class="flex items-center gap-3 border-b border-[#EEEEEA] px-5 py-3.5"
    >
      <span
        v-if="icon"
        class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#EFECFF] text-[#5B4BE8]"
        aria-hidden="true"
      >
        <CIcon :name="icon" class="h-4 w-4" />
      </span>
      <span
        v-else-if="step"
        class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#EFECFF] text-xs font-semibold text-[#5B4BE8]"
        aria-hidden="true"
      >
        {{ step }}
      </span>
      <div
        class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2.5 gap-y-0.5"
      >
        <h3 :id="titleId" class="text-[15px] font-semibold text-[#15151B]">
          {{ title }}
        </h3>
        <p v-if="hint" class="text-[12.5px] text-[#84848E]">{{ hint }}</p>
      </div>
      <slot name="aside" />
    </header>
    <div class="p-5">
      <slot />
    </div>
  </section>
</template>
