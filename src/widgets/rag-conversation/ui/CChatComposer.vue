<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { CAppButton, CIcon } from "@/shared/ui"

const props = defineProps<{
  canReply: boolean
  sending?: boolean
  handoverBusy?: boolean
}>()

const emit = defineEmits<{ send: [text: string]; takeOver: [] }>()

// Owned by the page, so a failed send keeps what the teammate typed.
const draft = defineModel<string>("draft", { default: "" })

const field = ref<HTMLTextAreaElement | null>(null)

const submit = () => {
  const text = draft.value.trim()
  if (text && !props.sending) emit("send", text)
}

const onEnter = (event: KeyboardEvent) => {
  // Enter confirms an IME composition before it sends anything.
  if (event.isComposing) return
  event.preventDefault()
  submit()
}

watch(
  () => props.canReply,
  async (canReply) => {
    if (!canReply) return
    await nextTick()
    field.value?.focus()
  }
)
</script>

<template>
  <footer class="border-t border-[#EEEEEA] p-3">
    <form v-if="canReply" class="flex items-end gap-2" @submit.prevent="submit">
      <label class="min-w-0 flex-1">
        <span class="sr-only">Reply to the customer</span>
        <textarea
          ref="field"
          v-model="draft"
          rows="1"
          placeholder="Write a reply… (Shift + Enter for a new line)"
          class="block max-h-32 min-h-9 w-full resize-none rounded-[10px] border border-[#E5E5E1] px-3 py-2 text-[13px] leading-5 text-[#15151B] outline-none transition placeholder:text-[#A1A1AA] focus:border-[#5B4BE8] focus:ring-2 focus:ring-[#5B4BE8]/15"
          @keydown.enter.exact="onEnter"
        />
      </label>
      <CAppButton
        type="submit"
        variant="primary"
        icon="send"
        :loading="sending"
        :disabled="!draft.trim()"
      >
        Send
      </CAppButton>
    </form>

    <div v-else class="flex items-center gap-2">
      <p
        class="flex h-9 min-w-0 flex-1 items-center gap-2 rounded-[10px] border border-[#E5E5E1] bg-[#FAFAF9] px-3 text-[13px] text-[#84848E]"
      >
        <CIcon name="lock" class="h-4 w-4 shrink-0" />
        <span class="truncate">Read-only transcript — take over to reply</span>
      </p>
      <CAppButton
        variant="primary"
        icon="user-round-check"
        :loading="handoverBusy"
        @click="emit('takeOver')"
      >
        Take over
      </CAppButton>
    </div>
  </footer>
</template>
