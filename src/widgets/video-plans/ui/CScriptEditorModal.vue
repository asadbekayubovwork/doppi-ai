<script setup lang="ts">
import { ref } from "vue"
import {
  useVideoLabels,
  type PlanVideo,
  type ScriptMessage,
} from "@/entities/video"
import { CBadge, CIcon } from "@/shared/ui"

defineProps<{
  open: boolean
  video: PlanVideo | null
  planTitle: string
  conversation: ScriptMessage[]
  currentScript: string
  proposedScript: string
}>()

const emit = defineEmits<{
  "update:open": [value: boolean]
  approve: []
}>()

const { day } = useVideoLabels()
const draft = ref("")
const QUICK = ["shorter", "cta", "hook"] as const

const close = () => emit("update:open", false)
const send = () => {
  draft.value = ""
}
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open && video"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0F0F17]/45 p-4 backdrop-blur-[2px]"
        @click.self="close"
        @keydown.esc="close"
      >
        <div
          class="modal-panel flex max-h-[88vh] w-full max-w-[900px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(16,17,26,0.24)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="script-editor-title"
        >
          <!-- Header -->
          <header class="flex items-start gap-3 border-b border-[#ECECE8] p-5">
            <span
              class="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#EFECFF] text-[#5B4BE8]"
            >
              <CIcon name="wand-sparkles" class="h-5 w-5" />
            </span>
            <div class="min-w-0 flex-1">
              <h2
                id="script-editor-title"
                class="text-[17px] font-semibold tracking-tight text-[#15151B]"
              >
                {{ $t("dashboard.video.plans.detail.editScript") }}
              </h2>
              <p class="mt-0.5 text-[12.5px] text-[#8A8A94]">
                {{
                  $t("dashboard.video.plans.script.meta", {
                    order: video.order,
                    title: video.title,
                    date: day(video.date),
                    time: video.time,
                  })
                }}
              </p>
            </div>
            <button
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E1] text-[#8E8E9C] transition hover:bg-[#FAFAF9]"
              :aria-label="$t('dashboard.common.close')"
              @click="close"
            >
              <CIcon name="x" class="h-4 w-4" />
            </button>
          </header>

          <!-- Body: chat + script diff -->
          <div class="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.15fr_0.85fr]">
            <!-- Chat -->
            <div class="flex min-h-0 flex-col border-r border-[#ECECE8]">
              <div class="flex-1 space-y-4 overflow-y-auto p-5">
                <div
                  v-for="message in conversation"
                  :key="message.id"
                  class="flex"
                  :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-5"
                    :class="
                      message.role === 'user'
                        ? 'bg-[#EFECFF] text-[#2E2A5B]'
                        : 'bg-[#F5F5F2] text-[#2A2A31]'
                    "
                  >
                    {{ message.text }}
                    <div
                      v-if="message.chips?.length"
                      class="mt-2 flex flex-wrap gap-1.5"
                    >
                      <CBadge
                        v-for="chip in message.chips"
                        :key="chip"
                        tone="success"
                        size="sm"
                      >
                        {{ chip }}
                      </CBadge>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Quick actions + composer -->
              <div class="border-t border-[#ECECE8] p-4">
                <div class="mb-3 flex flex-wrap gap-2">
                  <button
                    v-for="quick in QUICK"
                    :key="quick"
                    type="button"
                    class="rounded-full border border-[#E5E5E1] px-3 py-1.5 text-[12px] font-medium text-[#42424B] transition hover:border-[#C9C0F5] hover:bg-[#F7F6FE] hover:text-[#5B4BE8]"
                    @click="draft = $t(`dashboard.video.plans.script.quick.${quick}`)"
                  >
                    {{ $t(`dashboard.video.plans.script.quick.${quick}`) }}
                  </button>
                </div>
                <form class="flex items-center gap-2" @submit.prevent="send">
                  <div class="relative flex-1">
                    <CIcon
                      name="message-circle"
                      class="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A1A1AA]"
                    />
                    <input
                      v-model="draft"
                      :placeholder="$t('dashboard.video.plans.script.placeholder')"
                      class="h-10 w-full rounded-[10px] border border-[#E5E5E1] bg-white pl-9 pr-3 text-[13px] text-[#15151B] outline-none transition placeholder:text-[#A1A1AA] focus:border-[#5B4BE8] focus:ring-2 focus:ring-[#5B4BE8]/15"
                    />
                  </div>
                  <button
                    type="submit"
                    class="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#5B4BE8] text-white transition hover:bg-[#4F3FDC] disabled:opacity-50"
                    :disabled="!draft.trim()"
                    :aria-label="$t('dashboard.common.send')"
                  >
                    <CIcon name="arrow-up-right" class="h-4 w-4 -rotate-45" />
                  </button>
                </form>
              </div>
            </div>

            <!-- Script diff -->
            <div class="space-y-3 overflow-y-auto bg-[#FBFBFA] p-5">
              <div class="rounded-xl border border-[#ECECE8] bg-white p-3.5">
                <p
                  class="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#9A9AA2]"
                >
                  <CIcon name="file-text" class="h-3.5 w-3.5" />
                  {{ $t("dashboard.video.plans.script.current") }}
                </p>
                <p class="mt-2 text-[13px] leading-5 text-[#55555F]">
                  {{ currentScript }}
                </p>
              </div>

              <div
                class="rounded-xl border border-[#C9C0F5] bg-[#F7F6FE] p-3.5 ring-1 ring-[#E0DCF6]"
              >
                <p
                  class="flex items-center gap-1.5 text-[11.5px] font-semibold uppercase tracking-[0.06em] text-[#5B4BE8]"
                >
                  <CIcon name="wand-sparkles" class="h-3.5 w-3.5" />
                  {{ $t("dashboard.video.plans.script.proposed") }}
                </p>
                <p class="mt-2 text-[13px] leading-5 text-[#2E2A5B]">
                  {{ proposedScript }}
                </p>
              </div>

              <p
                class="flex items-start gap-2 rounded-lg bg-[#F2F2EF] px-3 py-2.5 text-[11.5px] leading-4 text-[#73737D]"
              >
                <CIcon name="info" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
                {{ $t("dashboard.video.plans.script.scopeNote") }}
              </p>
            </div>
          </div>

          <!-- Footer -->
          <footer
            class="flex flex-wrap items-center justify-between gap-3 border-t border-[#ECECE8] bg-[#FBFBFC] px-5 py-4"
          >
            <p class="text-[12px] text-[#8A8A94]">
              {{ $t("dashboard.video.plans.script.footer") }}
            </p>
            <div class="flex items-center gap-2.5">
              <button
                type="button"
                class="h-10 rounded-[10px] border border-[#E5E5E1] bg-white px-4 text-[13px] font-semibold text-[#15151B] transition hover:bg-[#FAFAF9]"
                @click="close"
              >
                {{ $t("dashboard.common.cancel") }}
              </button>
              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#5B4BE8] px-4 text-[13px] font-semibold text-white transition hover:bg-[#4F3FDC]"
                @click="emit('approve')"
              >
                <CIcon name="check" class="h-4 w-4" />
                {{ $t("dashboard.video.plans.script.approve") }}
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
