<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useHead } from "@unhead/vue"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { useRagAgentStore } from "@/entities/rag-agent"
import {
  downloadFile,
  useCopyToClipboard,
  usePageHeading,
  useToast,
} from "@/shared/lib"
import { CAppButton, CEmptyState, CSkeleton } from "@/shared/ui"
import {
  CChatDetailsCard,
  CChatPanel,
  CConversationList,
  CConversationToolbar,
  COutcomeCard,
  CRetrievedSourcesCard,
  transcriptToText,
} from "@/widgets/rag-conversation"

const props = defineProps<{ chatId: string }>()

const store = useRagAgentStore()
const auth = useAuthStore()
const toast = useToast()
const copy = useCopyToClipboard()

const loadState = ref<"loading" | "ready" | "missing" | "error">("loading")
const draft = ref("")
const isSending = ref(false)
const isHandoverBusy = ref(false)

const conversation = computed(() => store.details[props.chatId] ?? null)

// Handover is recorded by name; "You" stands in while there is no session.
const operatorName = computed(
  () =>
    [auth.user?.first_name, auth.user?.last_name].filter(Boolean).join(" ") ||
    "You"
)
const isHandledByMe = computed(
  () => conversation.value?.handoverTo === operatorName.value
)

useHead({ title: computed(() => `${props.chatId} — Do'ppi AI`) })
usePageHeading(() => ({ subtitle: `Conversations · ${props.chatId}` }))

const businessId = computed(() => auth.activeBusiness?.id ?? "")

const loadContext = async () => {
  if (!businessId.value) return
  await store.loadAgent(businessId.value)
  await store.loadConversations(businessId.value)
}

onMounted(() => void loadContext())
watch(businessId, () => void loadContext())

watch(
  () => props.chatId,
  async (chatId) => {
    draft.value = ""
    loadState.value = "loading"
    try {
      await loadContext()
      const detail = await store.loadConversation(chatId)
      // Ignore a response for a chat the user has already navigated away from.
      if (chatId === props.chatId)
        loadState.value = detail ? "ready" : "missing"
    } catch {
      if (chatId === props.chatId) loadState.value = "error"
    }
  },
  { immediate: true }
)

const toggleHandover = async () => {
  const chat = conversation.value
  if (!chat) return
  const takingOver = !isHandledByMe.value
  isHandoverBusy.value = true
  try {
    await store.setHandover(chat.id, takingOver ? operatorName.value : null)
    toast.success(
      takingOver
        ? "You're handling this chat"
        : "Chat handed back to the agent",
      takingOver
        ? "The agent stops replying until you hand it back."
        : undefined
    )
  } catch (error) {
    toast.error(
      "Couldn't change who handles the chat",
      messageForProblem(error, "Try again in a moment.")
    )
  } finally {
    isHandoverBusy.value = false
  }
}

const send = async (text: string) => {
  isSending.value = true
  try {
    await store.sendOperatorMessage(props.chatId, text)
    draft.value = ""
  } catch (error) {
    toast.error("Message not sent", messageForProblem(error, "Try again."))
  } finally {
    isSending.value = false
  }
}

const updateTags = async (tags: string[]) => {
  try {
    await store.updateTags(props.chatId, tags)
  } catch (error) {
    toast.error("Couldn't save tags", messageForProblem(error, "Try again."))
  }
}

const copyLink = () => copy(window.location.href, "Link copied")

const exportTranscript = () => {
  if (conversation.value) {
    downloadFile(
      `${conversation.value.id}-transcript.txt`,
      transcriptToText(conversation.value)
    )
  }
}
</script>

<template>
  <div class="flex flex-col gap-4 min-[1360px]:h-full">
    <!-- On wide screens the page fills the dashboard's scroll area and each
         column scrolls on its own; the single row is capped so tall content
         scrolls inside its column instead of stretching the page. -->
    <CConversationToolbar
      :chat-id="chatId"
      :conversation="conversation"
      :is-handled-by-me="isHandledByMe"
      :handover-busy="isHandoverBusy"
      @export="exportTranscript"
      @toggle-handover="toggleHandover"
    />

    <div
      class="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] min-[1360px]:grid-cols-[296px_minmax(0,1fr)_300px] min-[1360px]:grid-rows-[minmax(0,1fr)]"
    >
      <div class="hidden min-h-0 min-[1360px]:flex min-[1360px]:flex-col">
        <CConversationList
          class="flex-1"
          :conversations="store.conversations"
          :active-id="chatId"
          :total="
            store.agent?.stats.conversations ?? store.conversations.length
          "
          :loading="store.conversationsState !== 'ready'"
        />
      </div>

      <template v-if="conversation">
        <CChatPanel
          v-model:draft="draft"
          class="h-[640px] min-[1360px]:h-auto"
          :conversation="conversation"
          :can-reply="isHandledByMe"
          :sending="isSending"
          :handover-busy="isHandoverBusy"
          @send="send"
          @take-over="toggleHandover"
          @copy-link="copyLink"
          @export="exportTranscript"
        />
        <aside
          class="relative min-h-0 space-y-4 min-[1360px]:overflow-y-auto"
          aria-label="Conversation insights"
        >
          <CChatDetailsCard
            :conversation="conversation"
            @copy-id="copy(conversation.id, 'chat_id copied')"
          />
          <CRetrievedSourcesCard :sources="conversation.retrievedSources" />
          <COutcomeCard
            :tags="conversation.tags"
            :rating="conversation.rating"
            @update:tags="updateTags"
          />
        </aside>
      </template>

      <div
        v-else-if="loadState === 'loading'"
        class="grid gap-4 lg:col-span-2 lg:grid-cols-[minmax(0,1fr)_300px]"
        aria-busy="true"
        aria-label="Loading conversation"
      >
        <CSkeleton class="h-[640px] rounded-2xl min-[1360px]:h-full" />
        <div class="space-y-4">
          <CSkeleton class="h-72 rounded-2xl" />
          <CSkeleton class="h-48 rounded-2xl" />
        </div>
      </div>

      <CEmptyState
        v-else
        class="lg:col-span-2"
        icon="messages-square"
        :title="
          loadState === 'missing'
            ? 'Conversation not found'
            : 'Couldn\'t load this conversation'
        "
        :description="
          loadState === 'missing'
            ? `There is no chat with the id ${chatId}. It may belong to another business.`
            : 'Check your connection and try again.'
        "
      >
        <CAppButton icon="arrow-left" :to="{ name: 'RagAgent' }">
          Back to conversations
        </CAppButton>
      </CEmptyState>
    </div>
  </div>
</template>
