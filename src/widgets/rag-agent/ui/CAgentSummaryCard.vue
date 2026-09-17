<script setup lang="ts">
import { computed } from "vue"
import { CHANNELS, llmModelName, type RagAgent } from "@/entities/rag-agent"
import { formatCount } from "@/shared/lib"
import { CAppButton, CBadge, CIcon } from "@/shared/ui"
import { buildAgentMetrics } from "../model/agent-metrics"

const props = defineProps<{ agent: RagAgent }>()

defineEmits<{ configure: []; openPlayground: [] }>()

const metrics = computed(() => buildAgentMetrics(props.agent.stats))

const facts = computed(() => {
  const { model, temperature, documentCount, chunkCount, channels } =
    props.agent
  return [
    {
      icon: "cpu",
      text: `${llmModelName(model)} · temperature ${temperature}`,
    },
    {
      icon: "database",
      text: `${formatCount(documentCount)} documents · ${formatCount(chunkCount)} chunks`,
    },
    {
      icon: "share-2",
      text:
        channels.map((kind) => CHANNELS[kind].label).join(" · ") ||
        "No channels connected",
    },
  ]
})
</script>

<template>
  <section
    class="rounded-2xl border border-[#E5E5E1] bg-white p-5"
    aria-labelledby="agent-summary-title"
  >
    <div
      class="flex flex-col gap-4 border-b border-[#EEEEEA] pb-5 xl:flex-row xl:items-center xl:justify-between"
    >
      <div class="flex min-w-0 items-center gap-4">
        <span
          class="flex h-12 w-12 shrink-0 items-center justify-center rounded-[14px] bg-[#5B4BE8] text-white"
          aria-hidden="true"
        >
          <CIcon name="bot" class="h-6 w-6" />
        </span>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2">
            <h2
              id="agent-summary-title"
              class="text-[17px] font-semibold tracking-tight text-[#15151B]"
            >
              {{ agent.name }}
            </h2>
            <CBadge v-if="agent.status === 'live'" tone="success" dot>
              Live
            </CBadge>
            <CBadge v-else dot>Paused</CBadge>
            <CBadge tone="outline" icon="lock">One agent per business</CBadge>
          </div>
          <ul
            class="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-[13px] text-[#6A6A74]"
          >
            <li
              v-for="fact in facts"
              :key="fact.icon"
              class="inline-flex items-center gap-1.5"
            >
              <CIcon :name="fact.icon" class="h-4 w-4 text-[#84848E]" />
              {{ fact.text }}
            </li>
          </ul>
        </div>
      </div>

      <div class="flex shrink-0 flex-wrap gap-2.5">
        <CAppButton icon="settings-2" @click="$emit('configure')">
          Edit configuration
        </CAppButton>
        <CAppButton
          variant="primary"
          icon="sparkles"
          @click="$emit('openPlayground')"
        >
          Open playground
        </CAppButton>
      </div>
    </div>

    <dl class="grid grid-cols-2 gap-y-5 pt-5 sm:grid-cols-3 lg:grid-cols-5">
      <div
        v-for="metric in metrics"
        :key="metric.label"
        class="min-w-0 pr-4 lg:border-l lg:border-[#EEEEEA] lg:px-6 lg:first:border-l-0 lg:first:pl-0"
      >
        <dt class="text-xs text-[#6A6A74]">{{ metric.label }}</dt>
        <dd class="mt-2 flex flex-wrap items-center gap-2">
          <span
            class="text-[22px] font-semibold leading-none tracking-tight text-[#15151B]"
          >
            {{ metric.value }}
          </span>
          <CBadge
            v-if="metric.change"
            size="sm"
            :tone="metric.improved ? 'success' : 'danger'"
          >
            {{ metric.change }}
          </CBadge>
        </dd>
      </div>
    </dl>
  </section>
</template>
