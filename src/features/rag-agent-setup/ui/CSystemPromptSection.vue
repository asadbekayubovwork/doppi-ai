<script setup lang="ts">
import { computed, useId } from "vue"
import { formatCount } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import CSetupSection from "./CSetupSection.vue"

const props = defineProps<{ tokens: number; limit: number }>()

defineEmits<{ useTemplate: [] }>()

const prompt = defineModel<string>({ required: true })

const fieldId = useId()
const isOverLimit = computed(() => props.tokens > props.limit)
</script>

<template>
  <CSetupSection
    :step="4"
    title="System prompt"
    hint="Applies to every conversation on every channel"
  >
    <label :for="fieldId" class="sr-only">System prompt</label>
    <textarea
      :id="fieldId"
      v-model="prompt"
      rows="7"
      placeholder="Tell the agent who it is, what it may answer and when to hand the chat to a human."
      class="block w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-[13px] leading-6 text-[#15151B] outline-none transition placeholder:text-[#A1A1AA] focus:ring-2"
      :class="
        isOverLimit
          ? 'border-[#E7B8B8] focus:border-[#C42B2B] focus:ring-[#C42B2B]/15'
          : 'border-[#E5E5E1] focus:border-[#5B4BE8] focus:ring-[#5B4BE8]/15'
      "
      :aria-invalid="isOverLimit || undefined"
      :aria-describedby="`${fieldId}-tokens`"
    />
    <div class="mt-2 flex items-center justify-between gap-3">
      <p
        :id="`${fieldId}-tokens`"
        class="text-xs tabular-nums"
        :class="isOverLimit ? 'text-[#C42B2B]' : 'text-[#84848E]'"
      >
        {{ formatCount(tokens) }} / {{ formatCount(limit) }} tokens
      </p>
      <button
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold text-[#5B4BE8] transition hover:text-[#4F3FDC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BE8]/40"
        @click="$emit('useTemplate')"
      >
        <CIcon name="wand-sparkles" class="h-4 w-4" />
        Use a template
      </button>
    </div>
  </CSetupSection>
</template>
