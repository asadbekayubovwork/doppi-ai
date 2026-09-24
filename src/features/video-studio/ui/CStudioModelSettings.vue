<script setup lang="ts">
import { computed } from "vue"
import { CIcon, CSelect } from "@/shared/ui"
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

const modelOptions = computed(() =>
  props.models.map((item) => ({ value: item.model, label: item.name }))
)
const resolutionOptions = computed(() =>
  (selectedModel.value?.resolutions ?? []).map((value) => ({
    value,
    label: value,
  }))
)
const durationOptions = computed(() =>
  (selectedModel.value?.durations_seconds ?? []).map((seconds) => ({
    value: seconds,
    label: `${seconds}s`,
  }))
)

const onModelChange = (nextId: string | undefined) => {
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
      {{ $t("dashboard.video.studio.model.title") }}
    </span>

    <div
      v-if="loading"
      class="flex h-12 items-center gap-2 rounded-xl border border-[#DEDEE4] bg-[#FCFCFB] px-3 text-[13px] text-[#73737D]"
      role="status"
    >
      <CIcon name="loader-circle" class="h-4 w-4 animate-spin" />
      {{ $t("dashboard.video.studio.model.loading") }}
    </div>

    <div
      v-else-if="error !== null"
      class="grid gap-2 rounded-xl border border-[#F2C8C5] bg-[#FFF8F7] p-3 text-[12px] text-[#9C2E27]"
      role="alert"
    >
      <p>{{ error || $t("dashboard.video.studio.model.loadFailed") }}</p>
      <button
        type="button"
        class="min-h-11 justify-self-start rounded-lg border border-[#E7B2AD] px-3 text-[12px] font-semibold text-[#84251F] transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#8175EA]"
        @click="$emit('retry')"
      >
        {{ $t("dashboard.video.studio.model.reload") }}
      </button>
    </div>

    <div v-else class="grid grid-cols-2 gap-2.5">
      <CSelect
        :model-value="model"
        :options="modelOptions"
        :label="$t('dashboard.video.studio.model.model')"
        :aria-label="$t('dashboard.video.studio.model.title')"
        icon="cpu"
        size="xl"
        @update:model-value="onModelChange"
      />

      <CSelect
        v-model="resolution"
        :options="resolutionOptions"
        :label="$t('dashboard.video.studio.model.resolution')"
        icon="gauge"
        size="xl"
      />

      <CSelect
        v-model="durationSec"
        :options="durationOptions"
        :label="$t('dashboard.video.studio.model.duration')"
        icon="clock"
        size="xl"
      />

      <div
        class="flex min-h-12 items-center gap-2 rounded-xl border border-[#DEDEE4] bg-white px-3"
      >
        <CIcon name="audio-lines" class="h-4 w-4 text-[#84848E]" />
        <span class="text-[12px] font-medium text-[#42424B]">
          {{
            $t(
              selectedModel?.supports_audio
                ? "dashboard.video.studio.model.audio"
                : "dashboard.video.studio.model.noAudio"
            )
          }}
        </span>
      </div>
    </div>

    <div class="flex items-center justify-between text-[12px]">
      <span class="text-[#73737D]">{{ $t("dashboard.video.studio.model.estimate") }}</span>
      <span v-if="estimatedPrice" class="font-semibold text-[#15151B]">
        {{ estimatedPrice }}
      </span>
      <span v-else class="text-[#73737D]">
        {{ $t("dashboard.video.studio.model.noPrice") }}
      </span>
    </div>
  </div>
</template>
