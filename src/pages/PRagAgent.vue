<script setup lang="ts">
import { computed, onMounted, watch } from "vue"
import { useI18n } from "vue-i18n"
import { useRagAgentStore } from "@/entities/rag-agent"
import { useAuthStore } from "@/features/auth"
import { useRouter } from "vue-router"
import { formatTimeAgo, usePageHeading } from "@/shared/lib"
import { CAppButton, CEmptyState } from "@/shared/ui"
import {
  CAgentSummaryCard,
  CAgentSummarySkeleton,
  CConversationsTable,
} from "@/widgets/rag-agent"

const { t, locale } = useI18n()
const store = useRagAgentStore()
const auth = useAuthStore()
const router = useRouter()

const agent = computed(() => store.agent)
const isAgentPending = computed(() =>
  ["idle", "loading"].includes(store.agentState)
)
const areConversationsPending = computed(() =>
  ["idle", "loading"].includes(store.conversationsState)
)

usePageHeading(() => {
  if (!agent.value) return {}
  const { name, status, syncedAt } = agent.value
  const now = Date.now()
  const synced =
    now - new Date(syncedAt).getTime() < 60_000
      ? t("dashboard.rag.agent.syncedJustNow")
      : t("dashboard.rag.agent.syncedAgo", {
          age: formatTimeAgo(syncedAt, now, locale.value),
        })
  return {
    subtitle: t("dashboard.rag.agent.subtitle", {
      name,
      status: t(`dashboard.rag.status.${status}`),
      synced,
    }),
  }
})

const businessId = computed(() => auth.activeBusiness?.id ?? "")

const load = async () => {
  if (!businessId.value) return
  await store.loadAgent(businessId.value, {
    force: store.agentState === "error",
  })
  await store.loadConversations(businessId.value, {
    force: store.conversationsState === "error",
  })
}

onMounted(() => void load())
watch(businessId, () => void load())

const openPlayground = () => void router.push({ name: "RagPlayground" })
const openConfiguration = () => void router.push({ name: "RagAgentSettings" })
</script>

<template>
  <div class="grid gap-5">
    <CAgentSummarySkeleton v-if="isAgentPending" />

    <template v-else-if="agent">
      <CAgentSummaryCard
        :agent="agent"
        @configure="openConfiguration"
        @open-playground="openPlayground"
      />
      <CConversationsTable
        :conversations="store.conversations"
        :total="agent.stats.conversations"
        :loading="areConversationsPending"
      />
    </template>

    <CEmptyState
      v-else-if="store.agentState === 'error'"
      icon="triangle-alert"
      :title="$t('dashboard.rag.loadFailed')"
      :description="$t('dashboard.common.checkConnection')"
    >
      <CAppButton icon="refresh-cw" @click="load">
        {{ $t("dashboard.common.tryAgain") }}
      </CAppButton>
    </CEmptyState>

    <CEmptyState
      v-else
      icon="bot"
      :title="$t('dashboard.rag.agent.emptyTitle')"
      :description="$t('dashboard.rag.agent.emptyDescription')"
    >
      <CAppButton
        variant="primary"
        icon="circle-plus"
        :to="{ name: 'RagAgentCreate' }"
      >
        {{ $t("dashboard.rag.createAgent") }}
      </CAppButton>
    </CEmptyState>
  </div>
</template>
