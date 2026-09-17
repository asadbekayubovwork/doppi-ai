<script setup lang="ts">
import { ref } from "vue"
import { CIcon } from "@/shared/ui"
import type { DocumentDraft } from "../model/useAgentSetupForm"
import CKnowledgeDocumentRow from "./CKnowledgeDocumentRow.vue"
import CSetupSection from "./CSetupSection.vue"

defineProps<{
  documents: DocumentDraft[]
  /** Value for the file input's `accept` attribute. */
  accept: string
}>()

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
    title="Knowledge base"
    hint="PDF, DOCX, XLSX or TXT, up to 50 MB each"
  >
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
          Drag documents here or
          <span class="font-semibold underline-offset-2 group-hover:underline">
            browse files
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
        aria-label="Uploaded documents"
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
