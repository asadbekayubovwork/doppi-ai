<script setup lang="ts">
import { computed } from "vue"
import { CIcon } from "@/shared/ui"
import type { VideoModel } from "@/features/video-generator"

const props = defineProps<{
  models: VideoModel[]
  loading: boolean
  error: string | null
}>()

defineEmits<{ retry: [] }>()

const model = defineModel<string>("model", { required: true })
const resolution = defineModel<string>("resolution", { required: true })
const durationSec = defineModel<number>("durationSec", { required: true })

const selectedModel = computed(
  () => props.models.find((item) => item.model === model.value) ?? null
)
const estimatedPrice = computed(() => {
  const rate = selectedModel.value?.cost_per_second_usd
  return rate === null || rate === undefined
    ? null
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 4,
      }).format(rate * durationSec.value)
})

const onModelChange = (event: Event) => {
  const nextId = (event.target as HTMLSelectElement).value
  const next = props.models.find((item) => item.model === nextId)
  if (!next) return
  model.value = next.model
  if (!next.resolutions.includes(resolution.value))
    resolution.value = next.resolutions[0] ?? ""
  if (!next.durations_seconds.includes(durationSec.value))
    durationSec.value = next.durations_seconds[0] ?? 15
}
</script>

<template>
  <div class="grid gap-2.5">
    <span
      class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
    >
      Video modeli
    </span>

    <div
      v-if="loading"
      class="flex h-12 items-center gap-2 rounded-xl border border-[#DEDEE4] bg-[#FCFCFB] px-3 text-[13px] text-[#73737D]"
      role="status"
    >
      <CIcon name="loader-circle" class="h-4 w-4 animate-spin" />
      Modellar yuklanmoqda
    </div>

    <div
      v-else-if="error"
      class="grid gap-2 rounded-xl border border-[#F2C8C5] bg-[#FFF8F7] p-3 text-[12px] text-[#9C2E27]"
      role="alert"
    >
      <p>{{ error }}</p>
      <button
        type="button"
        class="min-h-11 justify-self-start rounded-lg border border-[#E7B2AD] px-3 text-[12px] font-semibold text-[#84251F] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8175EA]"
        @click="$emit('retry')"
      >
        Qayta yuklash
      </button>
    </div>

    <div v-else class="grid grid-cols-2 gap-2.5">
      <label class="relative min-w-0">
        <span
          class="pointer-events-none absolute left-3 top-1.5 text-[10px] text-[#9A9AA2]"
        >
          Model
        </span>
        <CIcon
          name="cpu"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84848E]"
        />
        <select
          :value="model"
          aria-label="Video model"
          :disabled="!models.length"
          class="h-12 w-full rounded-xl border border-[#DEDEE4] bg-white pl-9 pr-2 pt-3.5 text-[13px] font-medium text-[#202027] outline-none focus:border-[#8175EA] disabled:cursor-not-allowed disabled:bg-[#F5F5F3]"
          @change="onModelChange"
        >
          <option v-for="item in models" :key="item.model" :value="item.model">
            {{ item.name }}
          </option>
        </select>
      </label>

      <label class="relative min-w-0">
        <span
          class="pointer-events-none absolute left-3 top-1.5 text-[10px] text-[#9A9AA2]"
        >
          Resolution
        </span>
        <select
          v-model="resolution"
          aria-label="Resolution"
          :disabled="!selectedModel?.resolutions.length"
          class="h-12 w-full rounded-xl border border-[#DEDEE4] bg-white px-3 pt-3.5 text-[13px] font-medium text-[#202027] outline-none focus:border-[#8175EA] disabled:cursor-not-allowed disabled:bg-[#F5F5F3]"
        >
          <option
            v-for="value in selectedModel?.resolutions ?? []"
            :key="value"
            :value="value"
          >
            {{ value }}
          </option>
        </select>
      </label>

      <label class="relative min-w-0">
        <span
          class="pointer-events-none absolute left-3 top-1.5 text-[10px] text-[#9A9AA2]"
        >
          Davomiylik
        </span>
        <CIcon
          name="clock"
          class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#84848E]"
        />
        <select
          v-model.number="durationSec"
          aria-label="Duration"
          :disabled="!selectedModel?.durations_seconds.length"
          class="h-12 w-full rounded-xl border border-[#DEDEE4] bg-white pl-9 pr-2 pt-3.5 text-[13px] font-medium text-[#202027] outline-none focus:border-[#8175EA] disabled:cursor-not-allowed disabled:bg-[#F5F5F3]"
        >
          <option
            v-for="seconds in selectedModel?.durations_seconds ?? []"
            :key="seconds"
            :value="seconds"
          >
            {{ seconds }}s
          </option>
        </select>
      </label>

      <div
        class="flex min-h-12 items-center gap-2 rounded-xl border border-[#DEDEE4] bg-white px-3"
      >
        <CIcon name="audio-lines" class="h-4 w-4 text-[#84848E]" />
        <span class="text-[12px] font-medium text-[#42424B]">
          {{ selectedModel?.supports_audio ? "Audio bor" : "Audio yo'q" }}
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between text-[12px]">
      <span class="text-[#73737D]">Provayder taxmini</span>
      <span v-if="estimatedPrice" class="font-semibold text-[#15151B]">
        {{ estimatedPrice }}
      </span>
      <span v-else class="text-[#73737D]">Narx ko'rsatilmagan</span>
    </div>
  </div>
</template>
