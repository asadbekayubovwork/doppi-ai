<script setup lang="ts">
import { computed, useId } from "vue"
import { SIMILARITY_RANGE, TOP_K_RANGE } from "../model/useAgentSettingsForm"

const topK = defineModel<number>("topK", { required: true })
const similarityThreshold = defineModel<number>("similarityThreshold", {
  required: true,
})

const topKId = useId()
const thresholdId = useId()

// `v-model.number` leaves an empty field as "", so check the type too.
const isTopKInvalid = computed(
  () =>
    !Number.isInteger(topK.value) ||
    topK.value < TOP_K_RANGE.min ||
    topK.value > TOP_K_RANGE.max
)
const isThresholdInvalid = computed(
  () =>
    typeof similarityThreshold.value !== "number" ||
    similarityThreshold.value < SIMILARITY_RANGE.min ||
    similarityThreshold.value > SIMILARITY_RANGE.max
)

const inputClass = (invalid: boolean) =>
  invalid
    ? "border-[#E7B8B8] focus:border-[#C42B2B] focus:ring-[#C42B2B]/15"
    : "border-[#E5E5E1] focus:border-[#5B4BE8] focus:ring-[#5B4BE8]/15"
</script>

<template>
  <div class="grid gap-4 sm:grid-cols-2">
    <div>
      <label :for="topKId" class="field-label">
        {{ $t("dashboard.rag.retrieval.topK") }}
      </label>
      <input
        :id="topKId"
        v-model.number="topK"
        type="number"
        inputmode="numeric"
        :min="TOP_K_RANGE.min"
        :max="TOP_K_RANGE.max"
        step="1"
        class="field-input"
        :class="inputClass(isTopKInvalid)"
        :aria-invalid="isTopKInvalid || undefined"
        :aria-describedby="`${topKId}-hint`"
      />
      <p
        :id="`${topKId}-hint`"
        class="mt-1 text-xs"
        :class="isTopKInvalid ? 'text-[#C42B2B]' : 'text-[#84848E]'"
      >
        {{ $t("dashboard.rag.retrieval.topKHint", TOP_K_RANGE) }}
      </p>
    </div>

    <div>
      <label :for="thresholdId" class="field-label">
        {{ $t("dashboard.rag.retrieval.threshold") }}
      </label>
      <input
        :id="thresholdId"
        v-model.number="similarityThreshold"
        type="number"
        inputmode="decimal"
        :min="SIMILARITY_RANGE.min"
        :max="SIMILARITY_RANGE.max"
        step="0.05"
        class="field-input"
        :class="inputClass(isThresholdInvalid)"
        :aria-invalid="isThresholdInvalid || undefined"
        :aria-describedby="`${thresholdId}-hint`"
      />
      <p
        :id="`${thresholdId}-hint`"
        class="mt-1 text-xs"
        :class="isThresholdInvalid ? 'text-[#C42B2B]' : 'text-[#84848E]'"
      >
        {{ $t("dashboard.rag.retrieval.thresholdHint", SIMILARITY_RANGE) }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.field-label {
  @apply mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#84848E];
}

.field-input {
  @apply h-9 w-full rounded-[10px] border bg-white px-3 text-[13px] tabular-nums text-[#15151B] outline-none transition focus:ring-2;
}
</style>
