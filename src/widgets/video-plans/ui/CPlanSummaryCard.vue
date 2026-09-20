<script setup lang="ts">
import { CIcon } from "@/shared/ui"

defineProps<{
  title: string
  /** Simple label/value rows. */
  rows?: ReadonlyArray<{ label: string; value: string; accent?: boolean }>
  /** Icon + text bullet list (research insights). */
  bullets?: ReadonlyArray<{ icon: string; text: string }>
}>()
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5 shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <h2 class="text-[14px] font-semibold text-[#15151B]">{{ title }}</h2>

    <dl v-if="rows" class="mt-3 space-y-2.5">
      <div
        v-for="row in rows"
        :key="row.label"
        class="flex items-center justify-between text-[13px]"
      >
        <dt class="text-[#73737D]">{{ row.label }}</dt>
        <dd
          class="font-semibold tabular-nums"
          :class="row.accent ? 'text-[#177A46]' : 'text-[#15151B]'"
        >
          {{ row.value }}
        </dd>
      </div>
    </dl>

    <ul v-if="bullets" class="mt-3 space-y-2.5">
      <li
        v-for="(bullet, index) in bullets"
        :key="index"
        class="flex items-start gap-2.5 text-[12.5px] leading-5 text-[#42424B]"
      >
        <CIcon :name="bullet.icon" class="mt-0.5 h-4 w-4 shrink-0 text-[#5B4BE8]" />
        {{ bullet.text }}
      </li>
    </ul>
  </section>
</template>
