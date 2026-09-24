<script setup lang="ts">
import { nextTick, ref, watch } from "vue"
import { CPricingCards } from "@/entities/pricing"
import { CIcon } from "@/shared/ui"

const props = defineProps<{ open: boolean }>()
const emit = defineEmits<{ "update:open": [value: boolean] }>()

const closeButton = ref<HTMLButtonElement | null>(null)
const close = () => emit("update:open", false)

// Focus moves into the dialog so Escape closes it without a click first.
watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    closeButton.value?.focus()
  }
)
</script>

<template>
  <Teleport to="body">
    <Transition name="modal">
      <!-- The overlay scrolls, not the panel: four cards stack well past a
           phone's height, and centring inside a min-h-full wrapper keeps the
           top of a tall panel reachable. -->
      <div
        v-if="open"
        class="fixed inset-0 z-50 overflow-y-auto bg-[#0F0F17]/45 backdrop-blur-[2px]"
        @keydown.esc="close"
      >
        <div
          class="flex min-h-full items-center justify-center p-4 sm:p-6"
          @click.self="close"
        >
          <div
            class="modal-panel w-full max-w-[1120px] overflow-hidden rounded-2xl bg-white shadow-[0_24px_64px_rgba(16,17,26,0.24)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby="top-up-title"
          >
            <div class="flex items-start gap-4 border-b border-[#E9E9EF] p-5">
              <span
                class="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-[#F1FBD3] text-[#4C6B0B]"
                ><CIcon name="wallet" class="h-5 w-5"
              /></span>
              <div class="min-w-0 flex-1">
                <h2
                  id="top-up-title"
                  class="text-[19px] font-bold tracking-tight text-[#0F0F17]"
                >
                  {{ $t("dashboard.balance.topUp") }}
                </h2>
                <p class="mt-1 text-[13.5px] leading-5 text-[#6B6B78]">
                  {{ $t("pricing.pageSubtitle") }}
                </p>
              </div>
              <button
                ref="closeButton"
                type="button"
                class="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-[#E4E4EB] text-[#8E8E9C] hover:bg-[#F7F7F9]"
                :aria-label="$t('dashboard.common.close')"
                @click="close"
              >
                <CIcon name="x" class="h-4 w-4" />
              </button>
            </div>

            <!-- Top padding leaves room for the "most popular" badge that
                 rides above its card. -->
            <div class="bg-[#F7F7F8] px-5 pb-6 pt-9 sm:px-6">
              <CPricingCards />
              <p class="mt-6 text-center text-[13px] text-[#6B6B78]">
                {{ $t("pricing.trialNote") }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
