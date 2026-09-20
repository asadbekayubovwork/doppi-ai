<script setup lang="ts">
import { CVideoThumb } from "@/entities/video"
import { CAppButton, CBadge, CIcon } from "@/shared/ui"

defineProps<{
  isCreating: boolean
  hasResult: boolean
}>()

defineEmits<{ publish: []; download: []; regenerate: [] }>()

const PIPELINE = [
  { key: "script", label: "Script" },
  { key: "shots", label: "Kadrlar" },
  { key: "montage", label: "Montaj" },
  { key: "voice", label: "Ovoz" },
]
</script>

<template>
  <section
    class="flex flex-col rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <header
      class="flex items-center justify-between border-b border-[#ECECE8] px-5 py-4"
    >
      <div class="flex items-center gap-2">
        <h2 class="text-[15px] font-semibold text-[#15151B]">Natija</h2>
        <CBadge v-if="hasResult" tone="success" icon="circle-check">
          Tayyor
        </CBadge>
        <CBadge v-else-if="isCreating" tone="accent" icon="loader-circle">
          Yaratilmoqda
        </CBadge>
      </div>
      <span class="text-[12px] text-[#9A9AA2]">Veo 3 · 15s · 9:16</span>
    </header>

    <div class="flex flex-1 flex-col items-center px-5 py-6">
      <!-- Phone-frame vertical preview -->
      <div class="w-full max-w-[300px]">
        <CVideoThumb
          color="#8C8378"
          :play="hasResult"
          duration="0:15"
          rounded="rounded-[24px]"
          class="aspect-[9/16] w-full border-4 border-[#15151B]/5 shadow-[0_20px_50px_-20px_rgba(21,21,27,0.5)]"
        >
          <div
            v-if="isCreating"
            class="flex flex-col items-center gap-2 text-white"
          >
            <CIcon name="loader-circle" class="h-8 w-8 animate-spin" />
            <span class="text-[12px] font-medium">Generatsiya…</span>
          </div>
        </CVideoThumb>

        <div class="mt-4 text-center">
          <h3 class="text-[15px] font-semibold text-[#15151B]">
            Kuzgi menyu e'loni
          </h3>
          <p class="mt-0.5 text-[12px] text-[#8A8A94]">
            Bugun 14:20 · 120 kredit · 1080×1920
          </p>
        </div>
      </div>

      <!-- Actions -->
      <div class="mt-5 w-full max-w-[340px] space-y-2.5">
        <CAppButton
          variant="primary"
          icon="send"
          class="w-full"
          :disabled="!hasResult"
          @click="$emit('publish')"
        >
          Ijtimoiy tarmoqqa joylash
        </CAppButton>
        <div class="grid grid-cols-2 gap-2.5">
          <CAppButton
            icon="download"
            :disabled="!hasResult"
            @click="$emit('download')"
          >
            Yuklab olish
          </CAppButton>
          <CAppButton icon="refresh-cw" @click="$emit('regenerate')">
            Qayta yaratish
          </CAppButton>
        </div>
      </div>
    </div>

    <!-- Pipeline checklist -->
    <footer
      class="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t border-[#ECECE8] px-5 py-3.5"
    >
      <span
        v-for="step in PIPELINE"
        :key="step.key"
        class="inline-flex items-center gap-1.5 text-[12.5px] font-medium"
        :class="hasResult ? 'text-[#177A46]' : 'text-[#9A9AA2]'"
      >
        <CIcon
          :name="hasResult ? 'circle-check' : 'circle-dot'"
          class="h-4 w-4"
        />
        {{ step.label }}
      </span>
    </footer>
  </section>
</template>
