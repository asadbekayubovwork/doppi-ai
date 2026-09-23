<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue"
import { useRoute } from "vue-router"
import { CIcon } from "@/shared/ui"
import type { NavMenuColumn } from "../model/navMenus"

const props = defineProps<{
  /** DOM id of the panel, referenced by the trigger's aria-controls. */
  id: string
  /** i18n key of the trigger label. */
  label: string
  columns: NavMenuColumn[]
}>()

// Keeps the panel off the viewport edge when it can't centre under the trigger.
const EDGE_GAP = 16

const route = useRoute()
const root = ref<HTMLElement | null>(null)
const trigger = ref<HTMLElement | null>(null)
const panel = ref<HTMLElement | null>(null)
const isOpen = ref(false)
const panelLeft = ref(0)

const isActive = computed(() =>
  props.columns.some((column) => column.items.some((item) => item.to === route.path))
)

watch(() => route.fullPath, () => (isOpen.value = false))

// A wide panel has less room left of the trigger than it needs at lg widths, so
// it is centred under the trigger and then clamped into the viewport. Measured
// after v-show reveals it but before the first frame, so it never paints
// misplaced.
watch(isOpen, async (open) => {
  if (!open) return
  await nextTick()
  if (!root.value || !trigger.value || !panel.value) return

  const anchor = trigger.value.getBoundingClientRect()
  const width = panel.value.offsetWidth
  const centred = anchor.left + anchor.width / 2 - width / 2
  const left = Math.min(
    Math.max(centred, EDGE_GAP),
    window.innerWidth - EDGE_GAP - width
  )
  panelLeft.value = left - root.value.getBoundingClientRect().left
})

// Keyboard users tab out of the panel; close once focus leaves the menu.
const handleFocusOut = (event: FocusEvent) => {
  if (!root.value?.contains(event.relatedTarget as Node | null)) isOpen.value = false
}
</script>

<template>
  <div
    ref="root"
    class="relative"
    @mouseenter="isOpen = true"
    @mouseleave="isOpen = false"
    @focusout="handleFocusOut"
    @keydown.escape="isOpen = false"
  >
    <!-- Negative margin: the open-state pill grows around the label without
         pushing the neighbouring nav links. -->
    <button
      ref="trigger"
      type="button"
      class="-mx-3 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm transition-200"
      :class="
        isOpen
          ? 'bg-sand-100 text-sand-950'
          : isActive
            ? 'text-sand-950'
            : 'text-sand-500 hover:text-sand-950'
      "
      :aria-expanded="isOpen"
      :aria-controls="id"
      @click="isOpen = !isOpen"
    >
      {{ $t(label) }}
      <CIcon
        name="chevron-down"
        class="h-4 w-4 transition-transform duration-200"
        :class="isOpen ? 'rotate-180' : ''"
      />
    </button>

    <!-- v-show rather than v-if: crawlers only follow links that are in the DOM.
         The top padding bridges the gap to the trigger so hover survives it. -->
    <Transition name="dropdown">
      <div
        v-show="isOpen"
        :id="id"
        ref="panel"
        class="absolute top-full z-50 w-max origin-top pt-6"
        :style="{ left: `${panelLeft}px` }"
      >
        <!-- Solid, not frosted: inside the floating pill a backdrop-filter only
             sees the pill, so the page behind would show through unblurred.
             The header is fixed, so on short laptop screens a long column
             scrolls inside the panel instead of running off the viewport. -->
        <div
          class="flex max-h-[calc(100vh-7rem)] divide-x divide-sand-200 overflow-y-auto [scrollbar-color:#D7D2CC_transparent] [scrollbar-width:thin] rounded-3xl border border-sand-200 bg-white py-5 shadow-[0_24px_60px_-28px_rgba(12,10,9,0.3)]"
        >
          <div
            v-for="(column, index) in columns"
            :key="column.title ?? index"
            class="px-3"
            :class="column.title ? 'min-w-[180px]' : 'min-w-[160px]'"
          >
            <p v-if="column.title" class="px-3 pb-2 text-sm text-sand-500">
              {{ $t(column.title) }}
            </p>
            <ul>
              <li v-for="item in column.items" :key="item.label">
                <RouterLink
                  v-if="item.to"
                  :to="item.to"
                  class="flex whitespace-nowrap rounded-lg px-3 py-1.5 text-[15px] text-sand-950 transition-colors hover:bg-sand-100"
                >
                  {{ $t(item.label) }}
                </RouterLink>
                <span
                  v-else
                  class="flex items-center gap-2 whitespace-nowrap px-3 py-1.5 text-[15px] text-sand-600"
                >
                  {{ $t(item.label) }}
                  <span
                    class="rounded-full bg-sand-100 px-2 py-0.5 text-xs text-sand-500"
                  >
                    {{ $t("nav.comingSoon") }}
                  </span>
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>
