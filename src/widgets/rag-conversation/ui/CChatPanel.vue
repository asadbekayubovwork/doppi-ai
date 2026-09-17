<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue"
import type { ConversationDetail } from "@/entities/rag-agent"
import { groupMessagesByDay } from "../model/transcript"
import CChatComposer from "./CChatComposer.vue"
import CChatHeader from "./CChatHeader.vue"
import CChatMessage from "./CChatMessage.vue"

const props = defineProps<{
  conversation: ConversationDetail
  canReply: boolean
  sending?: boolean
  handoverBusy?: boolean
}>()

const emit = defineEmits<{
  send: [text: string]
  takeOver: []
  copyLink: []
  export: []
}>()

const draft = defineModel<string>("draft", { default: "" })

const groups = computed(() => groupMessagesByDay(props.conversation.messages))
const scroller = ref<HTMLElement | null>(null)

const scrollToLatest = async () => {
  await nextTick()
  const element = scroller.value
  if (element) element.scrollTop = element.scrollHeight
}

// Open at the newest message and follow the ones that arrive.
onMounted(scrollToLatest)
watch(
  () => [props.conversation.id, props.conversation.messages.length],
  scrollToLatest
)
</script>

<template>
  <section
    class="flex min-h-0 min-w-0 flex-col overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white"
    aria-label="Transcript"
  >
    <CChatHeader
      :conversation="conversation"
      @copy-link="emit('copyLink')"
      @export="emit('export')"
    />

    <div
      ref="scroller"
      class="relative min-h-0 flex-1 space-y-5 overflow-y-auto px-5 py-5"
      role="log"
      aria-live="polite"
    >
      <div v-for="group in groups" :key="group.key" class="space-y-4">
        <p
          class="flex items-center gap-3 text-xs text-[#84848E] before:h-px before:flex-1 before:bg-[#EEEEEA] after:h-px after:flex-1 after:bg-[#EEEEEA]"
        >
          {{ group.label }}
        </p>
        <CChatMessage
          v-for="message in group.messages"
          :key="message.id"
          :message="message"
        />
      </div>
    </div>

    <CChatComposer
      v-model:draft="draft"
      :can-reply="canReply"
      :sending="sending"
      :handover-busy="handoverBusy"
      @send="emit('send', $event)"
      @take-over="emit('takeOver')"
    />
  </section>
</template>
