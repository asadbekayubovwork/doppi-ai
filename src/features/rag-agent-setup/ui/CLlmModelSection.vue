<script setup lang="ts">
import { computed, useId } from "vue"
import { LLM_MODELS, type LlmModelId } from "@/entities/rag-agent"
import { describeTemperature } from "../model/prompt"
import CSetupSection from "./CSetupSection.vue"

const model = defineModel<LlmModelId>("model", { required: true })
const temperature = defineModel<number>("temperature", { required: true })

const temperatureId = useId()
const radioName = useId()

const temperatureLabel = computed(
  () =>
    `${temperature.value.toFixed(1)} · ${describeTemperature(temperature.value)}`
)
</script>

<template>
  <CSetupSection
    :step="3"
    title="LLM model"
    hint="Powers retrieval answers on every channel"
  >
    <fieldset>
      <legend class="sr-only">Model</legend>
      <div class="grid gap-3 sm:grid-cols-3">
        <label
          v-for="option in LLM_MODELS"
          :key="option.id"
          class="flex cursor-pointer flex-col gap-0.5 rounded-xl border px-3.5 py-3 transition has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-[#5B4BE8]/30"
          :class="
            model === option.id
              ? 'border-[#5B4BE8] bg-[#F5F3FF]'
              : 'border-[#E5E5E1] hover:border-[#D6D6D1] hover:bg-[#FAFAF9]'
          "
        >
          <span class="flex items-center gap-2">
            <input
              v-model="model"
              type="radio"
              class="h-4 w-4 shrink-0 accent-[#5B4BE8]"
              :name="radioName"
              :value="option.id"
            />
            <span class="text-[13.5px] font-semibold text-[#15151B]">
              {{ option.name }}
            </span>
          </span>
          <span class="pl-6 text-xs text-[#84848E]">
            {{ option.context }} · {{ option.strength }}
          </span>
        </label>
      </div>
    </fieldset>

    <div class="mt-4 flex items-center gap-4">
      <label :for="temperatureId" class="shrink-0 text-[13px] text-[#6A6A74]">
        Temperature
      </label>
      <input
        :id="temperatureId"
        v-model.number="temperature"
        type="range"
        min="0"
        max="1"
        step="0.1"
        class="temperature-range h-5 min-w-0 flex-1"
        :style="{ '--fill': `${temperature * 100}%` }"
        :aria-valuetext="temperatureLabel"
      />
      <output
        :for="temperatureId"
        class="w-28 shrink-0 text-right text-[13px] font-medium tabular-nums text-[#15151B]"
      >
        {{ temperatureLabel }}
      </output>
    </div>
  </CSetupSection>
</template>

<style scoped>
.temperature-range {
  appearance: none;
  cursor: pointer;
  background: transparent;
}

.temperature-range:focus-visible {
  outline: none;
}

.temperature-range::-webkit-slider-runnable-track {
  height: 4px;
  border-radius: 9999px;
  background: linear-gradient(
    to right,
    #5b4be8 var(--fill),
    #e5e5e1 var(--fill)
  );
}

.temperature-range::-webkit-slider-thumb {
  appearance: none;
  height: 16px;
  width: 16px;
  margin-top: -6px;
  border: 2px solid #5b4be8;
  border-radius: 9999px;
  background: #fff;
}

.temperature-range::-moz-range-track {
  height: 4px;
  border-radius: 9999px;
  background: #e5e5e1;
}

.temperature-range::-moz-range-progress {
  height: 4px;
  border-radius: 9999px;
  background: #5b4be8;
}

.temperature-range::-moz-range-thumb {
  height: 12px;
  width: 12px;
  border: 2px solid #5b4be8;
  border-radius: 9999px;
  background: #fff;
}

.temperature-range:focus-visible::-webkit-slider-thumb {
  box-shadow: 0 0 0 4px rgb(91 75 232 / 0.2);
}

.temperature-range:focus-visible::-moz-range-thumb {
  box-shadow: 0 0 0 4px rgb(91 75 232 / 0.2);
}
</style>
