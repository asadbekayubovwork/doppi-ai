<script setup lang="ts">
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { CIcon } from "@/shared/ui"
import type { DocumentDraft } from "../model/useKnowledgeDocuments"
import CKnowledgeDocumentRow from "./CKnowledgeDocumentRow.vue"
import CSetupSection from "./CSetupSection.vue"

const props = defineProps<{
  documents: DocumentDraft[]
  /** Value for the file input's `accept` attribute. */
  accept: string
  maxFileBytes: number | null
  icon?: string
  /** Replaces the upload-limits hint, e.g. with document counts. */
  hint?: string
}>()

const { t } = useI18n()

const limitsHint = computed(() =>
  props.maxFileBytes
    ? t("dashboard.rag.knowledge.limits", {
        size: Math.round(props.maxFileBytes / 1024 / 1024),
      })
    : t("dashboard.rag.knowledge.loadingLimits")
)

const emit = defineEmits<{ add: [files: File[]]; remove: [key: string] }>()

const isDragging = ref(false)
// dragenter/dragleave fire for every child the pointer crosses; counting them
// keeps the highlight from flickering.
let dragDepth = 0

const onDragEnter = () => {
  dragDepth += 1
  isDragging.value = true
}

const onDragLeave = () => {
  dragDepth = Math.max(0, dragDepth - 1)
  if (dragDepth === 0) isDragging.value = false
}

const onDrop = (event: DragEvent) => {
  dragDepth = 0
  isDragging.value = false
  const files = Array.from(event.dataTransfer?.files ?? [])
  if (files.length) emit("add", files)
}

const onPick = (event: Event) => {
  const input = event.target as HTMLInputElement
  const files = Array.from(input.files ?? [])
  if (files.length) emit("add", files)
  // Reset so picking the same file again still fires `change`.
  input.value = ""
}
</script>

<template>
  <CSetupSection
    :step="2"
    :icon="icon"
    :title="$t('dashboard.rag.knowledge.title')"
    :hint="hint ?? limitsHint"
  >
    <template v-if="$slots.aside" #aside><slot name="aside" /></template>
    <div class="space-y-2.5">
      <label
        class="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed px-4 py-5 text-center transition-colors focus-within:ring-2 focus-within:ring-[#5B4BE8]/30"
        :class="
          isDragging
            ? 'border-[#5B4BE8] bg-[#E9E5FF]'
            : 'border-[#B9B0F5] bg-[#F5F3FF] hover:bg-[#EFECFF]'
        "
        @dragenter.prevent="onDragEnter"
        @dragover.prevent
        @dragleave.prevent="onDragLeave"
        @drop.prevent="onDrop"
      >
        <CIcon name="cloud-upload" class="h-6 w-6 text-[#5B4BE8]" />
        <span class="text-[13.5px] font-medium text-[#5B4BE8]">
          {{ $t("dashboard.rag.knowledge.drop") }}
          <span class="font-semibold underline-offset-2 group-hover:underline">
            {{ $t("dashboard.rag.knowledge.browse") }}
          </span>
        </span>
        <input
          type="file"
          class="sr-only"
          multiple
          :accept="accept"
          @change="onPick"
        />
      </label>

      <TransitionGroup
        v-if="documents.length"
        tag="ul"
        name="fade"
        class="space-y-2.5"
        :aria-label="$t('dashboard.rag.knowledge.uploaded')"
      >
        <CKnowledgeDocumentRow
          v-for="document in documents"
          :key="document.key"
          :document="document"
          @remove="emit('remove', document.key)"
        />
      </TransitionGroup>
    </div>
  </CSetupSection>
</template>
