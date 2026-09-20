<script setup lang="ts">
import { computed, ref, watch } from "vue"
import {
  CVideoThumb,
  PLATFORMS,
  PLATFORM_CHANNELS,
  PUBLISH_TARGETS,
  STUDIO_CAPTION,
  STUDIO_HASHTAGS,
  type PublishTarget,
} from "@/entities/video"
import { CBadge, CIcon, CSwitch } from "@/shared/ui"

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{
  "update:open": [value: boolean]
  publish: [targets: string[]]
}>()

const targets = ref<PublishTarget[]>([])
const schedule = ref<"now" | "later">("now")

// Reset the toggles to their defaults each time the modal opens.
watch(
  () => props.open,
  (open) => {
    if (!open) return
    targets.value = PUBLISH_TARGETS.map((target) => ({ ...target }))
    schedule.value = "now"
  },
  { immediate: true }
)

const selectedTargets = computed(() =>
  targets.value.filter((target) => target.enabled).map((target) => target.platform)
)
const selectedCount = computed(() => selectedTargets.value.length)

const close = () => emit("update:open", false)
const publish = () => emit("publish", selectedTargets.value)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-[#0F0F17]/45 p-4 backdrop-blur-[2px]"
        @click.self="close"
        @keydown.esc="close"
      >
        <div
          class="modal-panel flex max-h-[90vh] w-full max-w-[560px] flex-col overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(16,17,26,0.24)]"
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-title"
        >
          <header class="flex items-start gap-3 border-b border-[#ECECE8] p-5">
            <span
              class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#E7F6EC] text-[#177A46]"
            >
              <CIcon name="check" class="h-5 w-5" stroke-width="2.5" />
            </span>
            <div class="min-w-0 flex-1">
              <h2
                id="publish-title"
                class="text-[16.5px] font-semibold tracking-tight text-[#15151B]"
              >
                Video tayyor — ijtimoiy tarmoqqa joylaymizmi?
              </h2>
              <p class="mt-0.5 text-[12.5px] text-[#8A8A94]">
                Kuzgi menyu e'loni · 15s · 9:16 · 1080×1920
              </p>
            </div>
            <button
              type="button"
              class="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#E5E5E1] text-[#8E8E9C] transition hover:bg-[#FAFAF9]"
              aria-label="Yopish"
              @click="close"
            >
              <CIcon name="x" class="h-4 w-4" />
            </button>
          </header>

          <div class="flex-1 space-y-5 overflow-y-auto p-5">
            <div class="flex gap-4">
              <CVideoThumb
                color="#8C8378"
                rounded="rounded-xl"
                class="aspect-[9/16] w-24 shrink-0"
              />

              <div class="flex-1 space-y-2">
                <p
                  class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
                >
                  Qayerga joylash
                </p>
                <label
                  v-for="target in targets"
                  :key="target.platform"
                  class="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition"
                  :class="
                    target.enabled
                      ? 'border-[#C9C0F5] bg-[#F7F6FE]'
                      : 'border-[#E5E5E1] bg-white'
                  "
                >
                  <span
                    class="grid h-7 w-7 place-items-center rounded-lg"
                    :style="{
                      backgroundColor: PLATFORMS[target.platform].bg,
                      color: PLATFORMS[target.platform].color,
                    }"
                  >
                    <CIcon
                      :name="PLATFORMS[target.platform].icon"
                      class="h-4 w-4"
                    />
                  </span>
                  <span class="min-w-0 flex-1">
                    <span class="block text-[13px] font-semibold text-[#24242A]">
                      {{ PLATFORM_CHANNELS[target.platform] }}
                    </span>
                    <span class="block truncate text-[11.5px] text-[#9A9AA2]">
                      {{ target.handle }}
                    </span>
                  </span>
                  <CSwitch
                    v-model="target.enabled"
                    :label="`${PLATFORM_CHANNELS[target.platform]} ga joylash`"
                  />
                </label>
              </div>
            </div>

            <!-- Caption -->
            <div>
              <div class="mb-1.5 flex items-center justify-between">
                <span
                  class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
                >
                  Matn (AI tayyorladi)
                </span>
                <button
                  type="button"
                  class="inline-flex items-center gap-1 text-[12px] font-semibold text-[#5B4BE8] transition hover:text-[#4F3FDC]"
                >
                  <CIcon name="wand-sparkles" class="h-3.5 w-3.5" />
                  Qayta yozish
                </button>
              </div>
              <div
                class="rounded-xl border border-[#E5E5E1] bg-[#FCFCFB] p-3 text-[13px] leading-5 text-[#2A2A31]"
              >
                {{ STUDIO_CAPTION }}
                <p class="mt-1.5 font-medium text-[#5B4BE8]">
                  {{ STUDIO_HASHTAGS.join(" ") }}
                </p>
              </div>
            </div>

            <!-- Schedule -->
            <div>
              <span
                class="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
              >
                Qachon
              </span>
              <div class="mt-1.5 flex flex-wrap items-center gap-2.5">
                <div
                  class="inline-flex items-center gap-0.5 rounded-[10px] border border-[#E7E5F3] bg-[#F5F4FB] p-0.5"
                >
                  <button
                    type="button"
                    class="h-8 rounded-[8px] px-3 text-[12.5px] font-semibold transition"
                    :class="
                      schedule === 'now'
                        ? 'bg-white text-[#15151B] shadow-[0_1px_2px_rgba(22,22,27,0.08)]'
                        : 'text-[#73737D]'
                    "
                    @click="schedule = 'now'"
                  >
                    Hozir
                  </button>
                  <button
                    type="button"
                    class="h-8 rounded-[8px] px-3 text-[12.5px] font-semibold transition"
                    :class="
                      schedule === 'later'
                        ? 'bg-white text-[#15151B] shadow-[0_1px_2px_rgba(22,22,27,0.08)]'
                        : 'text-[#73737D]'
                    "
                    @click="schedule = 'later'"
                  >
                    Rejalashtirish
                  </button>
                </div>
                <div
                  class="inline-flex items-center gap-2 rounded-[10px] border px-3 text-[13px] transition"
                  :class="
                    schedule === 'later'
                      ? 'h-9 border-[#DEDEE4] text-[#42424B]'
                      : 'h-9 border-[#EEEEEA] text-[#B4B4BC]'
                  "
                >
                  <CIcon name="calendar-days" class="h-4 w-4" />
                  10.09.2026
                </div>
                <div
                  class="inline-flex items-center gap-2 rounded-[10px] border px-3 text-[13px] transition"
                  :class="
                    schedule === 'later'
                      ? 'h-9 border-[#DEDEE4] text-[#42424B]'
                      : 'h-9 border-[#EEEEEA] text-[#B4B4BC]'
                  "
                >
                  <CIcon name="clock" class="h-4 w-4" />
                  18:00
                </div>
              </div>
            </div>

            <p
              class="flex items-start gap-2 rounded-xl bg-[#F2F0FC] px-3 py-2.5 text-[12px] leading-4 text-[#5B4BE8]"
            >
              <CIcon name="info" class="mt-0.5 h-3.5 w-3.5 shrink-0" />
              Joylangach video statistikasi (ko'rish, ER) dashboardga avtomatik
              tushadi.
            </p>
          </div>

          <footer
            class="flex items-center justify-between gap-3 border-t border-[#ECECE8] bg-[#FBFBFC] px-5 py-4"
          >
            <CBadge tone="neutral">{{ selectedCount }} ta tarmoq tanlangan</CBadge>
            <div class="flex items-center gap-2.5">
              <button
                type="button"
                class="h-10 rounded-[10px] border border-[#E5E5E1] bg-white px-4 text-[13px] font-semibold text-[#15151B] transition hover:bg-[#FAFAF9]"
                @click="close"
              >
                Keyinroq
              </button>
              <button
                type="button"
                class="inline-flex h-10 items-center gap-2 rounded-[10px] bg-[#5B4BE8] px-4 text-[13px] font-semibold text-white transition hover:bg-[#4F3FDC] disabled:opacity-50"
                :disabled="!selectedCount"
                @click="publish"
              >
                <CIcon name="send" class="h-4 w-4" />
                Joylash
              </button>
            </div>
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
