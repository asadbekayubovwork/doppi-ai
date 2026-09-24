<script setup lang="ts">
import { computed } from "vue"
import type { RetrievedSource } from "@/entities/rag-agent"
import { useCountLabel } from "@/shared/lib"
import { CIcon, CProgress } from "@/shared/ui"
import CInsightCard from "./CInsightCard.vue"

const props = defineProps<{ sources: RetrievedSource[] }>()

const count = useCountLabel()

const ranked = computed(() =>
  [...props.sources].sort((left, right) => right.score - left.score)
)
</script>

<template>
  <CInsightCard
    :title="$t('dashboard.rag.conversation.sourcesCard.title')"
    icon="database"
  >
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
              {{
                $t("dashboard.rag.conversation.sourcesCard.used", {
                  chunks: count("dashboard.plural.chunks", source.chunksUsed),
                })
              }}
            </p>
          </div>
          <span class="text-[13px] font-semibold tabular-nums text-[#15151B]">
            {{ source.score.toFixed(2) }}
          </span>
        </div>
        <CProgress
          class="mt-2.5"
          :value="source.score"
          :label="
            $t('dashboard.rag.conversation.sourcesCard.relevance', {
              document: source.document,
            })
          "
        />
        <details class="mt-2 text-xs text-[#6A6A74]">
          <summary class="cursor-pointer font-medium text-[#5B4BE8]">
            {{ $t("dashboard.rag.conversation.sourcesCard.evidence") }}
          </summary>
          <div
            v-for="chunk in source.chunks"
            :key="chunk.chunkId"
            class="mt-2 rounded-lg border border-[#EEEEEA] bg-[#FAFAF9] p-2.5"
          >
            <p class="font-medium text-[#15151B]">
              {{
                $t("dashboard.rag.conversation.sourcesCard.chunk", {
                  id: chunk.chunkId,
                  score: chunk.rerankScore.toFixed(3),
                })
              }}
            </p>
            <p class="mt-1 whitespace-pre-wrap text-[11px] leading-4">
              {{ chunk.content }}
            </p>
          </div>
        </details>
      </li>
    </ul>
    <p v-else class="px-4 py-6 text-center text-[13px] text-[#84848E]">
      {{ $t("dashboard.rag.conversation.sourcesCard.empty") }}
    </p>
  </CInsightCard>
</template>
