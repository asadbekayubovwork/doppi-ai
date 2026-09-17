<script setup lang="ts">
import { computed } from "vue"
import { llmModelName, type ChatMessage } from "@/entities/rag-agent"
import { formatClockTime } from "@/shared/lib"
import { CIcon } from "@/shared/ui"

const props = defineProps<{ message: ChatMessage }>()

const BUBBLES: Record<ChatMessage["author"], string> = {
  customer: "border border-[#E5E5E1] bg-white",
  agent: "bg-[#F1EEFF]",
  operator: "border border-[#D9D3FF] bg-white",
}

const isCustomer = computed(() => props.message.author === "customer")

const traceLabel = computed(() => {
  const trace = props.message.trace
  if (!trace) return null
  const seconds = (trace.latencyMs / 1000).toFixed(1)
  return `${llmModelName(trace.model)} · ${seconds} s · ${trace.chunks} chunks`
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
        Operator
      </p>
      <p class="whitespace-pre-line break-words">{{ message.text }}</p>
      <ul
        v-if="message.citations?.length"
        class="mt-2.5 flex flex-wrap gap-1.5"
        aria-label="Sources"
      >
        <li
          v-for="citation in message.citations"
          :key="`${citation.document}-${citation.location}`"
          class="inline-flex max-w-full items-center gap-1.5 rounded-lg border border-[#E0DCFA] bg-white px-2 py-1 text-xs text-[#3F3F46]"
        >
          <CIcon name="file-text" class="h-3.5 w-3.5 shrink-0 text-[#5B4BE8]" />
          <span class="truncate">
            {{ citation.document }} · {{ citation.location }}
          </span>
        </li>
      </ul>
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
          Customer marked this answer as {{ message.feedback }}
        </span>
      </template>
    </p>
  </article>
</template>
