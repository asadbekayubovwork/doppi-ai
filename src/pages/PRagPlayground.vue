<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useI18n } from "vue-i18n"
import { ragAgentApi, useRagAgentStore } from "@/entities/rag-agent"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { useToast } from "@/shared/lib"
import { CAppButton, CEmptyState, CIcon } from "@/shared/ui"

interface PlaygroundMessage {
  id: string
  role: "user" | "assistant"
  content: string
  sources?: Array<{ document_name: string; chunk_id: number }>
  latencyMs?: number
}

const { t } = useI18n()
const auth = useAuthStore()
const store = useRagAgentStore()
const toast = useToast()
const businessId = computed(() => auth.activeBusiness?.id ?? "")
const draft = ref("")
const sessionId = ref<string | null>(null)
const sending = ref(false)
const messages = ref<PlaygroundMessage[]>([])
const userId =
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? `playground:${crypto.randomUUID()}`
    : `playground:${Date.now()}`

onMounted(async () => {
  if (businessId.value) await store.loadAgent(businessId.value)
})

const send = async () => {
  const query = draft.value.trim()
  if (!query || !store.agent || !businessId.value || sending.value) return
  messages.value.push({
    id: `${Date.now()}-user`,
    role: "user",
    content: query,
  })
  draft.value = ""
  sending.value = true
  try {
    const result = await ragAgentApi.chat(businessId.value, {
      agentId: store.agent.id,
      userId,
      sessionId: sessionId.value,
      query,
    })
    sessionId.value = result.session_id
    messages.value.push({
      id: `${Date.now()}-assistant`,
      role: "assistant",
      content: result.answer,
      sources: result.sources,
      latencyMs: result.latency_ms,
    })
  } catch (error) {
    toast.error(
      t("dashboard.rag.playground.failed"),
      messageForProblem(error, t("dashboard.common.retry"))
    )
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="mx-auto grid w-full max-w-4xl gap-4">
    <header class="flex items-start justify-between gap-4">
      <div>
        <h2 class="text-xl font-semibold tracking-tight text-[#15151B]">
          {{ $t("dashboard.rag.playground.title") }}
        </h2>
        <p class="mt-1 text-[13px] text-[#6A6A74]">
          {{ $t("dashboard.rag.playground.description") }}
        </p>
      </div>
      <CAppButton :to="{ name: 'RagAgent' }" icon="arrow-left">
        {{ $t("dashboard.rag.playground.back") }}
      </CAppButton>
    </header>

    <CEmptyState
      v-if="store.agentState === 'ready' && !store.agent"
      icon="bot"
      :title="$t('dashboard.rag.playground.noAgentTitle')"
      :description="$t('dashboard.rag.playground.noAgentDescription')"
    >
      <CAppButton variant="primary" :to="{ name: 'RagAgentCreate' }">
        {{ $t("dashboard.rag.createAgent") }}
      </CAppButton>
    </CEmptyState>

    <section
      v-else
      class="flex min-h-[620px] flex-col overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white"
    >
      <div class="flex-1 space-y-4 overflow-y-auto p-5">
        <div
          v-if="!messages.length"
          class="grid h-full min-h-96 place-items-center text-center"
        >
          <div>
            <CIcon name="sparkles" class="mx-auto h-8 w-8 text-[#5B4BE8]" />
            <p class="mt-3 text-sm font-medium text-[#15151B]">
              {{ $t("dashboard.rag.playground.emptyTitle") }}
            </p>
            <p class="mt-1 text-xs text-[#84848E]">
              {{ $t("dashboard.rag.playground.emptyText") }}
            </p>
          </div>
        </div>
        <article
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[82%] rounded-2xl px-4 py-3 text-[13px] leading-5 text-[#15151B]"
            :class="
              message.role === 'user'
                ? 'bg-[#5B4BE8] text-white'
                : 'bg-[#F1EEFF]'
            "
          >
            <p class="whitespace-pre-wrap">{{ message.content }}</p>
            <ul
              v-if="message.sources?.length"
              class="mt-2 space-y-1 text-[11px] text-[#5B4BE8]"
            >
              <li
                v-for="source in message.sources"
                :key="`${source.document_name}-${source.chunk_id}`"
              >
                {{
                  $t("dashboard.rag.playground.chunk", {
                    document: source.document_name,
                    id: source.chunk_id,
                  })
                }}
              </li>
            </ul>
            <p v-if="message.latencyMs" class="mt-2 text-[10px] opacity-70">
              {{ (message.latencyMs / 1000).toFixed(1) }} s
            </p>
          </div>
        </article>
      </div>
      <form
        class="flex gap-2 border-t border-[#EEEEEA] p-4"
        @submit.prevent="send"
      >
        <input
          v-model="draft"
          class="min-w-0 flex-1 rounded-xl border border-[#D8D8D3] px-4 py-2.5 text-sm outline-none focus:border-[#5B4BE8]"
          :placeholder="$t('dashboard.rag.playground.placeholder')"
          :disabled="sending || !store.agent"
        />
        <CAppButton
          variant="primary"
          icon="send"
          :loading="sending"
          type="submit"
        >
          {{ $t("dashboard.common.send") }}
        </CAppButton>
      </form>
    </section>
  </div>
</template>
