<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import { formatCount, formatFileSize } from "@/shared/lib"
import {
  CBadge,
  CIcon,
  CIconButton,
  CProgress,
  type BadgeTone,
} from "@/shared/ui"
import type { DocumentDraft } from "../model/useKnowledgeDocuments"

const props = defineProps<{ document: DocumentDraft }>()

defineEmits<{ remove: [] }>()

const { t, locale } = useI18n()

const status = computed<{ label: string; tone: BadgeTone }>(() => {
  const { status, progress } = props.document
  if (status === "indexed")
    return { label: t("dashboard.rag.knowledge.indexed"), tone: "success" }
  if (status === "failed")
    return { label: t("dashboard.rag.knowledge.failed"), tone: "danger" }
  return {
    label: t("dashboard.rag.knowledge.embedding", {
      percent: Math.round(progress * 100),
    }),
    tone: "warning",
  }
})

const details = computed(() => {
  const { status, sizeBytes, chunkCount } = props.document
  const size = formatFileSize(sizeBytes)
  if (status === "indexed") {
    const chunks = chunkCount ?? 0
    return `${size} · ${t(
      "dashboard.plural.chunks",
      { count: formatCount(chunks, locale.value) },
      chunks
    )}`
  }
  if (status === "failed")
    return `${size} · ${props.document.error || t("dashboard.rag.knowledge.failedHint")}`
  return size
})
</script>

<template>
  <li
    class="flex items-center gap-3 rounded-xl border border-[#EEEEEA] bg-white px-3.5 py-2.5"
  >
    <CIcon name="file-text" class="h-5 w-5 shrink-0 text-[#5B4BE8]" />
    <div class="min-w-0 flex-1">
      <p class="truncate text-[13.5px] font-medium text-[#15151B]">
        {{ document.name }}
      </p>
      <CProgress
        v-if="document.status === 'embedding'"
        tone="warning"
        class="my-1 max-w-[280px]"
        :value="document.progress"
        :label="$t('dashboard.rag.knowledge.embeddingLabel', { name: document.name })"
      />
      <p class="truncate text-xs text-[#84848E]">{{ details }}</p>
    </div>
    <CBadge :tone="status.tone">{{ status.label }}</CBadge>
    <CIconButton
      icon="x"
      variant="ghost"
      size="sm"
      :label="$t('dashboard.rag.knowledge.remove', { name: document.name })"
      @click="$emit('remove')"
    />
  </li>
</template>
