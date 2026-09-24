<script setup lang="ts" generic="T extends string | number">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from "vue"
import CIcon from "./CIcon.vue"

export interface SelectOption<V extends string | number = string | number> {
  value: V
  label: string
  /** Secondary text shown muted next to the label in the list. */
  hint?: string
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    options: SelectOption<T>[]
    /** Small caption rendered inside the trigger, above the value. */
    label?: string
    /** Accessible name; falls back to `label`. */
    ariaLabel?: string
    /** Leading icon name (see `CIcon`). */
    icon?: string
    placeholder?: string
    disabled?: boolean
    /** Trigger height: sm 36px · md 40px · lg 44px · xl 48px. */
    size?: "sm" | "md" | "lg" | "xl"
  }>(),
  { size: "md" }
)

const emit = defineEmits<{ change: [value: T] }>()
const model = defineModel<T>()

const id = useId()
const listId = `${id}-list`
const optionId = (index: number) => `${id}-opt-${index}`

const trigger = ref<HTMLButtonElement | null>(null)
const panel = ref<HTMLUListElement | null>(null)
const open = ref(false)
const activeIndex = ref(-1)
const placement = ref<"bottom" | "top">("bottom")
const panelStyle = ref<Record<string, string>>({})

const selectedIndex = computed(() =>
  props.options.findIndex((option) => option.value === model.value)
)
const selected = computed(() => props.options[selectedIndex.value] ?? null)
const isDisabled = computed(() => props.disabled || !props.options.length)

const sizeClass = computed(
  () =>
    ({
      sm: "h-9 rounded-[10px] text-[13px]",
      md: "h-10 rounded-xl text-[13px]",
      lg: "h-11 rounded-xl text-[13.5px]",
      xl: "h-12 rounded-xl text-[13.5px]",
    })[props.size]
)

const PANEL_MAX_HEIGHT = 288
const GAP = 6

const position = () => {
  const rect = trigger.value?.getBoundingClientRect()
  if (!rect) return
  const below = window.innerHeight - rect.bottom
  const above = rect.top
  placement.value =
    below < Math.min(PANEL_MAX_HEIGHT, 180) && above > below ? "top" : "bottom"
  const room = (placement.value === "bottom" ? below : above) - GAP - 8
  panelStyle.value = {
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
    maxWidth: `${Math.max(rect.width, 320)}px`,
    maxHeight: `${Math.max(120, Math.min(PANEL_MAX_HEIGHT, room))}px`,
    ...(placement.value === "bottom"
      ? { top: `${rect.bottom + GAP}px` }
      : { bottom: `${window.innerHeight - rect.top + GAP}px` }),
  }
}

const isEnabled = (index: number) =>
  index >= 0 && index < props.options.length && !props.options[index].disabled

const scrollActiveIntoView = () =>
  nextTick(() =>
    document
      .getElementById(optionId(activeIndex.value))
      ?.scrollIntoView?.({ block: "nearest" })
  )

const setActive = (index: number) => {
  activeIndex.value = index
  scrollActiveIntoView()
}

const step = (from: number, dir: 1 | -1) => {
  const total = props.options.length
  for (let i = 1; i <= total; i++) {
    const next = (from + dir * i + total) % total
    if (isEnabled(next)) return next
  }
  return from
}

const edge = (dir: 1 | -1) =>
  dir === 1 ? step(-1, 1) : step(props.options.length, -1)

const show = () => {
  if (isDisabled.value || open.value) return
  position()
  open.value = true
  setActive(isEnabled(selectedIndex.value) ? selectedIndex.value : edge(1))
}

const hide = (focusTrigger = true) => {
  if (!open.value) return
  open.value = false
  if (focusTrigger) trigger.value?.focus()
}

const choose = (index: number) => {
  if (!isEnabled(index)) return
  const { value } = props.options[index]
  const changed = value !== model.value
  model.value = value
  hide()
  if (changed) emit("change", value)
}

let typed = ""
let typedTimer: ReturnType<typeof setTimeout> | undefined
const typeahead = (char: string) => {
  typed += char.toLowerCase()
  clearTimeout(typedTimer)
  typedTimer = setTimeout(() => (typed = ""), 500)
  const current = open.value ? activeIndex.value : selectedIndex.value
  // A fresh keystroke moves past the current match; a longer query may keep it.
  const start = typed.length === 1 ? current + 1 : Math.max(current, 0)
  const total = props.options.length
  for (let i = 0; i < total; i++) {
    const index = (start + i) % total
    const option = props.options[index]
    if (!option.disabled && option.label.toLowerCase().startsWith(typed)) {
      if (open.value) setActive(index)
      else choose(index)
      return
    }
  }
}

const onKeydown = (event: KeyboardEvent) => {
  if (isDisabled.value) return
  const { key } = event
  if (key === "ArrowDown" || key === "ArrowUp") {
    event.preventDefault()
    const dir = key === "ArrowDown" ? 1 : -1
    if (!open.value) show()
    else setActive(step(activeIndex.value, dir))
  } else if (key === "Home" || key === "End") {
    if (!open.value) return
    event.preventDefault()
    setActive(edge(key === "Home" ? 1 : -1))
  } else if (key === "Enter" || key === " ") {
    event.preventDefault()
    if (open.value) choose(activeIndex.value)
    else show()
  } else if (key === "Escape") {
    if (open.value) {
      event.preventDefault()
      event.stopPropagation()
      hide()
    }
  } else if (key === "Tab") {
    hide(false)
  } else if (
    key.length === 1 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey
  ) {
    typeahead(key)
  }
}

const onPointerDownOutside = (event: Event) => {
  const target = event.target as Node
  if (trigger.value?.contains(target) || panel.value?.contains(target)) return
  hide(false)
}

const onViewportChange = (event: Event) => {
  // Scrolling inside the list itself must not re-position it.
  if (event.target instanceof Node && panel.value?.contains(event.target))
    return
  position()
}

watch(open, (isOpen) => {
  const method = isOpen ? "addEventListener" : "removeEventListener"
  document[method]("pointerdown", onPointerDownOutside, true)
  window[method]("scroll", onViewportChange, true)
  window[method]("resize", onViewportChange)
})

watch(isDisabled, (value) => value && hide(false))

onBeforeUnmount(() => {
  open.value = false
  clearTimeout(typedTimer)
  document.removeEventListener("pointerdown", onPointerDownOutside, true)
  window.removeEventListener("scroll", onViewportChange, true)
  window.removeEventListener("resize", onViewportChange)
})
</script>

<template>
  <div class="relative min-w-0">
    <button
      ref="trigger"
      type="button"
      role="combobox"
      aria-haspopup="listbox"
      :aria-expanded="open"
      :aria-controls="listId"
      :aria-activedescendant="
        open && activeIndex >= 0 ? optionId(activeIndex) : undefined
      "
      :aria-label="ariaLabel || label"
      :disabled="isDisabled"
      class="group flex w-full items-center gap-2.5 border bg-white pr-2.5 text-left font-medium text-[#202027] outline-none transition-[border-color,box-shadow,background-color] hover:border-[#CBCBD4] focus-visible:border-[#8175EA] focus-visible:ring-[3px] focus-visible:ring-[#8175EA]/15 disabled:cursor-not-allowed disabled:bg-[#F5F5F3] disabled:text-[#9A9AA2] disabled:hover:border-[#DEDEE4]"
      :class="[
        sizeClass,
        icon ? 'pl-3' : 'pl-3.5',
        open
          ? 'border-[#8175EA] ring-[3px] ring-[#8175EA]/15'
          : 'border-[#DEDEE4]',
      ]"
      @click="open ? hide() : show()"
      @keydown="onKeydown"
    >
      <CIcon
        v-if="icon"
        :name="icon"
        class="h-4 w-4 shrink-0 text-[#84848E] transition-colors group-focus-visible:text-[#5B4BE8]"
        :class="open ? 'text-[#5B4BE8]' : ''"
      />
      <span class="grid min-w-0 flex-1 leading-tight">
        <span
          v-if="label"
          class="truncate text-[10px] font-medium text-[#9A9AA2]"
        >
          {{ label }}
        </span>
        <span
          class="truncate"
          :class="selected ? '' : 'font-normal text-[#A1A1AA]'"
        >
          {{ selected?.label ?? placeholder ?? $t("dashboard.common.select") }}
        </span>
      </span>
      <CIcon
        name="chevron-down"
        class="h-4 w-4 shrink-0 text-[#84848E] transition-transform duration-200"
        :class="open ? 'rotate-180 text-[#5B4BE8]' : ''"
      />
    </button>

    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        leave-active-class="transition duration-100 ease-in"
        :enter-from-class="`opacity-0 scale-[0.97] ${placement === 'bottom' ? '-translate-y-1' : 'translate-y-1'}`"
        :leave-to-class="`opacity-0 scale-[0.97]`"
      >
        <ul
          v-if="open"
          :id="listId"
          ref="panel"
          role="listbox"
          data-lenis-prevent
          :aria-label="ariaLabel || label"
          tabindex="-1"
          class="fixed z-[1100] overflow-y-auto overscroll-contain rounded-xl border border-[#E5E5E1] bg-white p-1 shadow-[0_12px_32px_-8px_rgba(21,21,27,0.18),0_2px_6px_rgba(21,21,27,0.06)]"
          :class="placement === 'bottom' ? 'origin-top' : 'origin-bottom'"
          :style="panelStyle"
          @mousedown.prevent
        >
          <li
            v-for="(option, index) in options"
            :id="optionId(index)"
            :key="String(option.value)"
            role="option"
            :aria-selected="index === selectedIndex"
            :aria-disabled="option.disabled || undefined"
            class="flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-[13px] transition-colors"
            :class="[
              option.disabled
                ? 'cursor-not-allowed text-[#B4B4BC]'
                : index === selectedIndex
                  ? 'font-semibold text-[#4B3DD6]'
                  : 'text-[#2A2A33]',
              index === activeIndex && !option.disabled ? 'bg-[#F3F2FE]' : '',
            ]"
            @pointermove="
              !option.disabled && activeIndex !== index && (activeIndex = index)
            "
            @click="choose(index)"
          >
            <span class="min-w-0 flex-1 truncate">
              {{ option.label }}
              <span v-if="option.hint" class="ml-1 font-normal text-[#9A9AA2]">
                {{ option.hint }}
              </span>
            </span>
            <CIcon
              v-if="index === selectedIndex"
              name="check"
              :stroke-width="2.25"
              class="h-4 w-4 shrink-0 text-[#5B4BE8]"
            />
          </li>
        </ul>
      </Transition>
    </Teleport>
  </div>
</template>
