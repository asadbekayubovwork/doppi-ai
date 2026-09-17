<script setup lang="ts">
import { computed } from "vue"
import type { RetrievedSource } from "@/entities/rag-agent"
import { CIcon, CProgress } from "@/shared/ui"
import CInsightCard from "./CInsightCard.vue"

const props = defineProps<{ sources: RetrievedSource[] }>()

const ranked = computed(() =>
  [...props.sources].sort((left, right) => right.score - left.score)
)
</script>

<template>
  <CInsightCard title="Retrieved sources" icon="database">
    <ul v-if="ranked.length" class="divide-y divide-[#EEEEEA]">
      <li v-for="source in ranked" :key="source.document" class="px-4 py-3">
        <div class="flex items-start gap-2.5">
          <CIcon
            name="file-text"
            class="mt-0.5 h-4 w-4 shrink-0 text-[#5B4BE8]"
          />
          <div class="min-w-0 flex-1">
            <p class="truncate text-[13px] font-medium text-[#15151B]">
              {{ source.document }}
            </p>
            <p class="text-xs text-[#84848E]">
              {{ source.chunksUsed }}
              {{ source.chunksUsed === 1 ? "chunk" : "chunks" }} used
            </p>
          </div>
          <span class="text-[13px] font-semibold tabular-nums text-[#15151B]">
            {{ source.score.toFixed(2) }}
          </span>
        </div>
        <CProgress
          class="mt-2.5"
          :value="source.score"
          :label="`Relevance of ${source.document}`"
        />
      </li>
    </ul>
    <p v-else class="px-4 py-6 text-center text-[13px] text-[#84848E]">
      No documents were retrieved for this chat.
    </p>
  </CInsightCard>
</template>
