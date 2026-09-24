<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useI18n } from "vue-i18n"
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

const { t, locale } = useI18n()
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

usePageHeading(() => ({
  subtitle: t("dashboard.rag.conversation.subtitle", { id: props.chatId }),
}))

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
      t(
        takingOver
          ? "dashboard.rag.conversation.handlingTitle"
          : "dashboard.rag.conversation.handedBack"
      ),
      takingOver ? t("dashboard.rag.conversation.handlingDetail") : undefined
    )
  } catch (error) {
    toast.error(
      t("dashboard.rag.conversation.handoverFailed"),
      messageForProblem(error, t("dashboard.common.tryLater"))
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
    toast.error(
      t("dashboard.rag.conversation.notSent"),
      messageForProblem(error, t("dashboard.common.retry"))
    )
  } finally {
    isSending.value = false
  }
}

const updateTags = async (tags: string[]) => {
  try {
    await store.updateTags(props.chatId, tags)
  } catch (error) {
    toast.error(
      t("dashboard.rag.conversation.tagsFailed"),
      messageForProblem(error, t("dashboard.common.retry"))
    )
  }
}

const copyLink = () =>
  copy(window.location.href, t("dashboard.rag.conversation.linkCopied"))

const exportTranscript = () => {
  if (conversation.value) {
    downloadFile(
      `${conversation.value.id}-transcript.txt`,
      transcriptToText(conversation.value, t, locale.value)
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
          :aria-label="$t('dashboard.rag.conversation.insights')"
        >
          <CChatDetailsCard
            :conversation="conversation"
            @copy-id="
              copy(conversation.id, $t('dashboard.rag.conversation.idCopied'))
            "
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
        :aria-label="$t('dashboard.rag.conversation.loading')"
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
            ? $t('dashboard.rag.conversation.notFound')
            : $t('dashboard.rag.conversation.loadFailed')
        "
        :description="
          loadState === 'missing'
            ? $t('dashboard.rag.conversation.notFoundDetail', { id: chatId })
            : $t('dashboard.common.checkConnection')
        "
      >
        <CAppButton icon="arrow-left" :to="{ name: 'RagAgent' }">
          {{ $t("dashboard.rag.conversation.back") }}
        </CAppButton>
      </CEmptyState>
    </div>
  </div>
</template>
