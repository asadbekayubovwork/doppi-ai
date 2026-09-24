<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"
import {
  ACCEPTED_EXTENSIONS,
  CAgentIdentitySection,
  CChangeHistory,
  CChannelsSection,
  CKnowledgeBaseSection,
  CLlmModelSection,
  CRetrievalFields,
  CSystemPromptSection,
  PROMPT_TOKEN_LIMIT,
} from "@/features/rag-agent-setup"
import { CAppButton, CBadge, CEmptyState, CIcon, CSkeleton } from "@/shared/ui"
import { useRagAgentSettingsPage } from "./model/useRagAgentSettingsPage"

const {
  store,
  form,
  agent,
  isSaving,
  isChangingStatus,
  isDeleting,
  knowledgeHint,
  embeddingNotice,
  history,
  plural,
  changed,
  load,
  addFiles,
  removeDocument,
  save,
  discard,
  toggleStatus,
  remove,
} = useRagAgentSettingsPage()

const { t } = useI18n()
const statusAction = computed(() =>
  t(`dashboard.rag.settings.${agent.value?.status === "live" ? "pause" : "resume"}`)
)
</script>

<template>
  <div class="grid grid-cols-1 gap-5">
    <CEmptyState
      v-if="store.agentState === 'error'"
      icon="triangle-alert"
      :title="$t('dashboard.rag.loadFailed')"
      :description="$t('dashboard.common.checkConnection')"
    >
      <CAppButton icon="refresh-cw" @click="load">
        {{ $t("dashboard.common.tryAgain") }}
      </CAppButton>
    </CEmptyState>

    <CEmptyState
      v-else-if="store.agentState === 'ready' && !agent"
      icon="bot"
      :title="$t('dashboard.rag.settings.noAgentTitle')"
      :description="$t('dashboard.rag.settings.noAgentDescription')"
    >
      <CAppButton
        variant="primary"
        icon="circle-plus"
        :to="{ name: 'RagAgentCreate' }"
      >
        {{ $t("dashboard.rag.createAgent") }}
      </CAppButton>
    </CEmptyState>

    <div
      v-else-if="!agent"
      class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]"
      aria-busy="true"
      :aria-label="$t('dashboard.rag.settings.loading')"
    >
      <div class="grid grid-cols-1 gap-5">
        <CSkeleton class="h-10 w-80 max-w-full" />
        <CSkeleton v-for="n in 3" :key="n" class="h-44 rounded-2xl" />
      </div>
      <CSkeleton class="h-[420px] rounded-2xl" />
    </div>

    <template v-else>
      <header
        class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between"
      >
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-2.5">
            <h2 class="text-xl font-semibold tracking-tight text-[#15151B]">
              {{ $t("dashboard.rag.settings.title") }}
            </h2>
            <CBadge
              v-if="agent.status === 'live'"
              tone="success"
              icon="activity"
            >
              {{ agent.name }} · {{ $t("dashboard.rag.status.live") }}
            </CBadge>
            <CBadge v-else icon="pause">
              {{ agent.name }} · {{ $t("dashboard.rag.status.paused") }}
            </CBadge>
          </div>
          <p class="mt-1 text-[13.5px] text-[#6A6A74]">
            {{ $t("dashboard.rag.settings.description") }}
          </p>
        </div>
        <div class="flex shrink-0 flex-wrap items-center gap-2.5">
          <CBadge v-if="form.changes.length" tone="warning" dot>
            {{ plural("unsavedChanges", form.changes.length) }}
          </CBadge>
          <CAppButton
            :disabled="!form.changes.length || isSaving"
            @click="discard"
          >
            {{ $t("dashboard.rag.settings.discard") }}
          </CAppButton>
          <CAppButton
            variant="primary"
            icon="check"
            :loading="isSaving"
            :disabled="!form.changes.length"
            @click="save"
          >
            {{ $t("dashboard.rag.settings.save") }}
          </CAppButton>
        </div>
      </header>

      <div
        class="grid grid-cols-1 items-start gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(320px,380px)]"
      >
        <div class="grid grid-cols-1 gap-5">
          <CAgentIdentitySection
            v-model:name="form.name"
            v-model:description="form.description"
            icon="bot"
          >
            <template #aside>
              <div class="flex shrink-0 items-center gap-2">
                <CBadge v-if="changed('identity')" tone="warning" dot>
                  {{ $t("dashboard.common.changed") }}
                </CBadge>
                <CAppButton
                  size="sm"
                  :icon="agent.status === 'live' ? 'pause' : 'play'"
                  :loading="isChangingStatus"
                  :aria-label="statusAction"
                  @click="toggleStatus"
                >
                  <span class="hidden sm:inline">{{ statusAction }}</span>
                </CAppButton>
                <CAppButton
                  size="sm"
                  variant="danger"
                  icon="trash-2"
                  :loading="isDeleting"
                  :aria-label="$t('dashboard.rag.settings.delete')"
                  @click="remove"
                >
                  <span class="hidden sm:inline">
                    {{ $t("dashboard.rag.settings.delete") }}
                  </span>
                </CAppButton>
              </div>
            </template>
          </CAgentIdentitySection>

          <CKnowledgeBaseSection
            icon="database"
            :hint="knowledgeHint"
            :documents="form.documents"
            :accept="ACCEPTED_EXTENSIONS.join(',')"
            :max-file-bytes="form.maxFileBytes"
            @add="addFiles"
            @remove="removeDocument"
          />

          <CLlmModelSection
            v-model:model="form.model"
            v-model:temperature="form.temperature"
            icon="sparkles"
            :hint="$t('dashboard.rag.settings.modelHint')"
            :models="store.models"
            :loading="store.configurationState === 'loading'"
          >
            <template v-if="changed('model')" #aside>
              <CBadge tone="warning" dot>
                {{ $t("dashboard.common.changed") }}
              </CBadge>
            </template>
            <CRetrievalFields
              v-model:top-k="form.topK"
              v-model:similarity-threshold="form.similarityThreshold"
            />
          </CLlmModelSection>

          <CSystemPromptSection
            v-model="form.systemPrompt"
            icon="message-square-text"
            :tokens="form.promptTokens"
            :limit="PROMPT_TOKEN_LIMIT"
          >
            <template v-if="changed('prompt')" #aside>
              <CBadge tone="warning" dot>
                {{ $t("dashboard.common.changed") }}
              </CBadge>
            </template>
            <template #action>
              <button
                v-if="changed('prompt')"
                type="button"
                class="inline-flex items-center gap-1.5 rounded-md text-[13px] font-semibold text-[#5B4BE8] transition hover:text-[#4F3FDC] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4BE8]/40"
                @click="form.revertPrompt"
              >
                <CIcon name="history" class="h-4 w-4" />
                {{ $t("dashboard.rag.settings.restorePrompt") }}
              </button>
            </template>
          </CSystemPromptSection>
        </div>

        <div class="grid grid-cols-1 gap-5">
          <CChannelsSection
            icon="plug"
            :hint="$t('dashboard.rag.settings.channelsHint')"
            :channels="form.channels"
            :available="form.availableChannels"
            @toggle="form.setChannelEnabled"
            @credential="form.setCredential"
            @add="form.addChannel"
          >
            <template v-if="changed('channels')" #aside>
              <CBadge tone="warning" dot>
                {{ $t("dashboard.common.changed") }}
              </CBadge>
            </template>
          </CChannelsSection>
          <CChangeHistory :entries="history" :notice="embeddingNotice" />
        </div>
      </div>
    </template>
  </div>
</template>
