<script setup lang="ts">
import { CAppButton, CBadge, CIcon, CSelect } from "@/shared/ui"

defineProps<{
  language: string
  canCreate: boolean
  isCreating: boolean
}>()

defineEmits<{ submit: [] }>()

const topic = defineModel<string>("topic", { required: true })
const sourceText = defineModel<string>("sourceText", { required: true })
const cta = defineModel<string>("cta", { required: true })
const referenceLinks = defineModel<string>("referenceLinks", { required: true })
const durationSec = defineModel<number>("durationSec", { required: true })
const aspectRatio = defineModel<"9:16" | "16:9" | "1:1">("aspectRatio", {
  required: true,
})
const subtitles = defineModel<boolean>("subtitles", { required: true })
const previewOnly = defineModel<boolean>("previewOnly", { required: true })
const researchMode = defineModel<"fast" | "deep">("researchMode", {
  required: true,
})
</script>

<template>
  <section
    id="new-video"
    class="overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white shadow-[0_12px_32px_rgba(22,22,27,0.04)]"
  >
    <div class="border-b border-[#ECECE8] px-5 py-4 sm:px-6">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div class="flex items-center gap-2">
            <span
              class="grid h-8 w-8 place-items-center rounded-xl bg-[#EFECFF] text-[#5B4BE8]"
            >
              <CIcon name="wand-sparkles" class="h-4 w-4" />
            </span>
            <h2 class="text-[17px] font-semibold text-[#15151B]">New video</h2>
          </div>
          <p class="mt-2 text-[13px] text-[#73737D]">
            Describe the result. OpenMontage handles research, script, shots,
            voice and montage.
          </p>
        </div>
        <CBadge tone="outline" icon="globe">{{
          language.toUpperCase()
        }}</CBadge>
      </div>
    </div>

    <form class="grid gap-5 p-5 sm:p-6" @submit.prevent="$emit('submit')">
      <label class="grid gap-2">
        <span
          class="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#797983]"
        >
          Video prompt
        </span>
        <textarea
          v-model="topic"
          required
          maxlength="8000"
          rows="5"
          placeholder="What should the video explain, show, and make the viewer feel?"
          class="min-h-32 resize-y rounded-xl border border-[#DEDEE4] bg-[#FCFCFB] px-4 py-3 text-sm leading-6 text-[#1D1D22] outline-none transition placeholder:text-[#AAAAB3] focus:border-[#8175EA] focus:bg-white focus:ring-4 focus:ring-[#5B4BE8]/10"
        />
      </label>

      <div class="grid gap-4 md:grid-cols-3">
        <label class="grid gap-2">
          <span class="text-xs font-medium text-[#55555F]">Format</span>
          <CSelect
            v-model="aspectRatio"
            :options="[
              { value: '9:16', label: '9:16', hint: 'Vertical' },
              { value: '1:1', label: '1:1', hint: 'Square' },
              { value: '16:9', label: '16:9', hint: 'Landscape' },
            ]"
            icon="layout-grid"
          />
        </label>
        <label class="grid gap-2">
          <span class="text-xs font-medium text-[#55555F]">Duration</span>
          <div class="relative">
            <input
              v-model.number="durationSec"
              type="number"
              min="1"
              max="180"
              class="h-10 w-full rounded-xl border border-[#DEDEE4] bg-white px-3 pr-9 text-sm text-[#202027] outline-none focus:border-[#8175EA]"
            />
            <span
              class="pointer-events-none absolute right-3 top-2.5 text-xs text-[#92929C]"
              >sec</span
            >
          </div>
        </label>
        <label class="grid gap-2">
          <span class="text-xs font-medium text-[#55555F]">Research</span>
          <CSelect
            v-model="researchMode"
            :options="[
              { value: 'fast', label: 'Fast research' },
              { value: 'deep', label: 'Deep research' },
            ]"
            icon="search"
          />
        </label>
      </div>

      <details class="group rounded-xl border border-[#E7E7E3] bg-[#FAFAF8]">
        <summary
          class="flex cursor-pointer list-none items-center justify-between px-4 py-3 text-sm font-semibold text-[#3D3D45]"
        >
          Optional direction and references
          <CIcon
            name="chevron-down"
            class="h-4 w-4 transition group-open:rotate-180"
          />
        </summary>
        <div class="grid gap-4 border-t border-[#E7E7E3] p-4">
          <label class="grid gap-2">
            <span class="text-xs font-medium text-[#55555F]"
              >Approved script or source text</span
            >
            <textarea
              v-model="sourceText"
              rows="3"
              maxlength="40000"
              class="resize-y rounded-xl border border-[#DEDEE4] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#8175EA]"
            />
          </label>
          <div class="grid gap-4 md:grid-cols-2">
            <label class="grid gap-2">
              <span class="text-xs font-medium text-[#55555F]"
                >Call to action</span
              >
              <input
                v-model="cta"
                maxlength="2000"
                class="h-10 rounded-xl border border-[#DEDEE4] bg-white px-3 text-sm outline-none focus:border-[#8175EA]"
              />
            </label>
            <label class="grid gap-2">
              <span class="text-xs font-medium text-[#55555F]"
                >Reference links · one HTTPS URL per line</span
              >
              <textarea
                v-model="referenceLinks"
                rows="2"
                class="resize-y rounded-xl border border-[#DEDEE4] bg-white px-3 py-2 text-sm outline-none focus:border-[#8175EA]"
              />
            </label>
          </div>
        </div>
      </details>

      <div
        class="flex flex-col gap-4 rounded-xl border border-[#E7E4FA] bg-[#F8F7FF] p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div class="flex flex-wrap gap-x-5 gap-y-3">
          <label
            class="flex cursor-pointer items-center gap-2 text-sm text-[#42424B]"
          >
            <input
              v-model="subtitles"
              type="checkbox"
              class="h-4 w-4 accent-[#5B4BE8]"
            />
            Burn subtitles
          </label>
          <label
            class="flex cursor-pointer items-center gap-2 text-sm text-[#42424B]"
          >
            <input
              v-model="previewOnly"
              type="checkbox"
              class="h-4 w-4 accent-[#5B4BE8]"
            />
            Prompt preview only
          </label>
        </div>
        <CAppButton
          type="submit"
          variant="primary"
          icon="sparkles"
          :disabled="!canCreate"
          :loading="isCreating"
        >
          {{ previewOnly ? "Generate preview" : "Generate video" }}
        </CAppButton>
      </div>
      <p class="text-xs leading-5 text-[#81818B]">
        Provider and voice use the service-managed defaults until catalog
        endpoints are available.
      </p>
    </form>
  </section>
</template>
