<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { llmModelName, type ChatMessage } from "@/entities/rag-agent"
import { formatClockTime, useCountLabel } from "@/shared/lib"
import { CIcon } from "@/shared/ui"

const props = defineProps<{ message: ChatMessage }>()

const BUBBLES: Record<ChatMessage["author"], string> = {
  customer: "border border-[#E5E5E1] bg-white",
  agent: "bg-[#F1EEFF]",
  operator: "border border-[#D9D3FF] bg-white",
}

const { t } = useI18n()
const count = useCountLabel()
const isCustomer = computed(() => props.message.author === "customer")

const traceLabel = computed(() => {
  const trace = props.message.trace
  if (!trace) return null
  return t("dashboard.rag.conversation.trace", {
    model: llmModelName(trace.model),
    seconds: (trace.latencyMs / 1000).toFixed(1),
    chunks: count("dashboard.plural.chunks", trace.chunks),
  })
})
</script>

<template>
  <article
    class="flex flex-col"
    :class="isCustomer ? 'items-start' : 'items-end'"
  >
    <div
      class="max-w-[85%] rounded-2xl px-4 py-3 text-[13px] leading-5 text-[#15151B] sm:max-w-[75%]"
      :class="BUBBLES[message.author]"
    >
      <p
        v-if="message.author === 'operator'"
        class="mb-1 text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#5B4BE8]"
      >
        {{ $t("dashboard.rag.conversation.operator") }}
      </p>
      <p class="whitespace-pre-line break-words">{{ message.text }}</p>
      <div
        v-if="message.citations?.length"
        class="mt-2.5 space-y-1.5"
        :aria-label="$t('dashboard.rag.conversation.sources')"
      >
        <details
          v-for="citation in message.citations"
          :key="`${citation.document}-${citation.chunkId}`"
          class="max-w-full rounded-lg border border-[#E0DCFA] bg-white px-2 py-1 text-xs text-[#3F3F46]"
        >
          <summary class="flex cursor-pointer items-center gap-1.5">
            <CIcon
              name="file-text"
              class="h-3.5 w-3.5 shrink-0 text-[#5B4BE8]"
            />
            <span class="truncate"
              >{{ citation.document }} · {{ citation.location }}</span
            >
            <span class="ml-auto tabular-nums text-[#84848E]">{{
              citation.rerankScore.toFixed(3)
            }}</span>
          </summary>
          <p
            class="mt-2 whitespace-pre-wrap border-t border-[#EEEEEA] pt-2 text-[11px] leading-4 text-[#6A6A74]"
          >
            {{ citation.excerpt }}
          </p>
          <p class="mt-1 text-[10px] text-[#84848E]">
            {{
              $t("dashboard.rag.conversation.scores", {
                vector: citation.vectorSimilarity.toFixed(3),
                rerank: citation.rerankScore.toFixed(3),
              })
            }}
          </p>
        </details>
      </div>
    </div>

    <p class="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#84848E]">
      <time :datetime="message.sentAt">
        {{ formatClockTime(message.sentAt) }}
      </time>
      <template v-if="traceLabel">
        <span aria-hidden="true">•</span>
        <span>{{ traceLabel }}</span>
      </template>
      <template v-if="message.feedback">
        <CIcon
          name="thumbs-up"
          class="h-3.5 w-3.5"
          :class="
            message.feedback === 'positive'
              ? 'text-[#177A46]'
              : 'rotate-180 text-[#C42B2B]'
          "
        />
        <span class="sr-only">
          {{ $t(`dashboard.rag.conversation.feedback.${message.feedback}`) }}
        </span>
      </template>
    </p>
  </article>
</template>
