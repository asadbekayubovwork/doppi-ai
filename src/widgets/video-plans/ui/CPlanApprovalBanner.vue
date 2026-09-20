<script setup lang="ts">
import { CAppButton, CIcon } from "@/shared/ui"

defineProps<{ title: string; subtitle: string }>()

defineEmits<{ reject: []; edit: []; approve: [] }>()
</script>

<template>
  <div
    class="flex flex-col gap-3 rounded-2xl border border-[#F3DFB8] bg-[radial-gradient(circle_at_88%_20%,rgba(217,119,6,0.1),transparent_36%),linear-gradient(135deg,#FFFBF3_0%,#FEF6E9_100%)] px-5 py-4 lg:flex-row lg:items-center lg:justify-between"
  >
    <div class="flex items-start gap-3">
      <span
        class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#FBEAC9] text-[#B45309]"
      >
        <CIcon name="calendar-check" class="h-5 w-5" />
      </span>
      <div>
        <p class="text-[14.5px] font-semibold text-[#8A5A16]">{{ title }}</p>
        <p class="mt-0.5 text-[12.5px] leading-5 text-[#A47435]">
          {{ subtitle }}
        </p>
      </div>
    </div>
    <div class="flex flex-wrap items-center gap-2">
      <CAppButton icon="x" @click="$emit('reject')">Rad etish</CAppButton>
      <CAppButton icon="wand-sparkles" @click="$emit('edit')">
        AI bilan tahrirlash
      </CAppButton>
      <CAppButton variant="primary" icon="check" @click="$emit('approve')">
        Planni tasdiqlash
      </CAppButton>
    </div>
  </div>
</template>
