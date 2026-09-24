<script setup lang="ts">
import { computed, useId } from "vue"
import { useI18n } from "vue-i18n"
import { formatCount } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import CSetupSection from "./CSetupSection.vue"

const props = defineProps<{ tokens: number; limit: number; icon?: string }>()

defineEmits<{ useTemplate: [] }>()

const prompt = defineModel<string>({ required: true })

const { locale } = useI18n()
const fieldId = useId()
const isOverLimit = computed(() => props.tokens > props.limit)
</script>

<template>
  <CSetupSection
    :step="4"
    :icon="icon"
    :title="$t('dashboard.rag.prompt.title')"
    :hint="$t('dashboard.rag.prompt.hint')"
  >
    <template v-if="$slots.aside" #aside><slot name="aside" /></template>
    <label :for="fieldId" class="sr-only">
      {{ $t("dashboard.rag.prompt.title") }}
    </label>
    <textarea
      :id="fieldId"
      v-model="prompt"
      rows="7"
      :placeholder="$t('dashboard.rag.prompt.placeholder')"
      class="block w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-[13px] leading-6 text-[#15151B] outline-none transition placeholder:text-[#A1A1AA] focus:ring-2"
      :class="
        isOverLimit
          ? 'border-[#E7B8B8] focus:border-[#C42B2B] focus:ring-[#C42B2B]/15'
          : 'border-[#E5E5E1] focus:border-[#5B4BE8] focus:ring-[#5B4BE8]/15'
      "
      :aria-invalid="isOverLimit || undefined"
      :aria-describedby="`${fieldId}-tokens`"
    />
    <div class="mt-2 flex min-h-[20px] items-center justify-between gap-3">
      <p
        :id="`${fieldId}-tokens`"
        class="text-xs tabular-nums"
        :class="isOverLimit ? 'text-[#C42B2B]' : 'text-[#84848E]'"
      >
        {{
          $t("dashboard.rag.prompt.tokens", {
            count: formatCount(tokens, locale),
            limit: formatCount(limit, locale),
          })
        }}
      </p>
      <!-- A page that passes #action owns this corner, even when its content
           is empty for the moment. -->
      <slot v-if="$slots.action" name="action" />
      <button
        v-else
        type="button"
        class="inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold text-[#5B4BE8] transition hover:text-[#4F3FDC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BE8]/40"
        @click="$emit('useTemplate')"
      >
        <CIcon name="wand-sparkles" class="h-4 w-4" />
        {{ $t("dashboard.rag.prompt.useTemplate") }}
      </button>
    </div>
  </CSetupSection>
</template>
