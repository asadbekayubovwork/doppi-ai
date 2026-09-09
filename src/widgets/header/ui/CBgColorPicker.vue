<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue"
import { useGroundColor, normalizeHex } from "@/shared/lib"

/*
   Preview control for the page ground colour. Lives in the header, writes to
   the `--bg-ground` CSS variable, so every `.section-dark` / `bg-ground`
   surface follows instantly. Mounted only where `isGroundPickerEnabled()`
   allows it — dev, or `?bg` on a deployed build.
*/

const { ground, setGround, resetGround, presets, defaultGround } =
  useGroundColor()

const isOpen = ref(false)
const root = ref<HTMLElement | null>(null)
const draft = ref<string>(ground.value)
const copied = ref(false)

// The hex field is free text, so it only commits once it parses.
const commitDraft = () => {
  const hex = normalizeHex(draft.value)
  if (hex) setGround(hex)
}

const copyHex = async () => {
  try {
    await navigator.clipboard.writeText(ground.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1400)
  } catch {
    // Clipboard blocked (insecure origin, denied permission) — the hex is on
    // screen anyway, so there is nothing to recover from.
  }
}

const handleOutside = (event: MouseEvent) => {
  if (isOpen.value && !root.value?.contains(event.target as Node))
    isOpen.value = false
}

const handleEscape = (event: KeyboardEvent) => {
  if (event.key === "Escape") isOpen.value = false
}

watch(ground, (value) => (draft.value = value))

onMounted(() => {
  document.addEventListener("click", handleOutside)
  document.addEventListener("keydown", handleEscape)
})

onUnmounted(() => {
  document.removeEventListener("click", handleOutside)
  document.removeEventListener("keydown", handleEscape)
})
</script>

<template>
  <div ref="root" class="relative">
    <button
      type="button"
      class="flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-2.5 text-white transition-colors hover:border-[#6633EE]/60"
      :aria-expanded="isOpen"
      aria-label="Fon rangini tanlash"
      @click="isOpen = !isOpen"
    >
      <span
        class="h-5 w-5 rounded-full border border-white/25"
        :style="{ backgroundColor: ground }"
      />
      <span
        class="hidden text-[11px] font-medium uppercase tracking-wide text-white/70 sm:inline"
      >
        {{ ground }}
      </span>
    </button>

    <Transition name="picker">
      <div
        v-if="isOpen"
        class="absolute right-0 top-full z-50 mt-2 w-[260px] rounded-2xl border border-white/10 bg-[#1C132C] p-4 shadow-2xl"
      >
        <div class="mb-3 flex items-center justify-between">
          <span
            class="text-xs font-medium uppercase tracking-wide text-white/60"
            >Fon rangi</span
          >
          <button
            type="button"
            class="text-xs text-white/50 transition-colors hover:text-white"
            @click="resetGround"
          >
            Reset
          </button>
        </div>

        <input
          type="color"
          class="color-field mb-3 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent p-0"
          :value="ground"
          aria-label="Rang tanlagich"
          @input="setGround(($event.target as HTMLInputElement).value)"
        />

        <div class="mb-3 flex items-center gap-2">
          <input
            v-model="draft"
            type="text"
            spellcheck="false"
            maxlength="7"
            class="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm uppercase tracking-wide text-white outline-none transition-colors focus:border-[#6633EE]/70"
            placeholder="#0E041F"
            @input="commitDraft"
            @keyup.enter="commitDraft"
          />
          <button
            type="button"
            class="shrink-0 rounded-lg border border-white/10 px-2.5 py-2 text-xs text-white/70 transition-colors hover:border-[#6633EE]/60 hover:text-white"
            @click="copyHex"
          >
            {{ copied ? "✓" : "Copy" }}
          </button>
        </div>

        <p class="mb-2 text-[11px] text-white/40">
          Tayyor pog'onalar (ochroq →)
        </p>
        <div class="grid grid-cols-6 gap-1.5">
          <button
            v-for="preset in presets"
            :key="preset.hex"
            type="button"
            class="group flex flex-col items-center gap-1"
            :title="preset.hex"
            @click="setGround(preset.hex)"
          >
            <span
              class="h-8 w-full rounded-md border transition-colors"
              :class="
                ground === preset.hex
                  ? 'border-[#8F6BFF]'
                  : 'border-white/15 group-hover:border-white/40'
              "
              :style="{ backgroundColor: preset.hex }"
            />
            <span class="text-[9px] text-white/40">+{{ preset.points }}</span>
          </button>
        </div>

        <p class="mt-3 text-[11px] leading-snug text-white/35">
          Asl rang {{ defaultGround }}. Tanlov brauzerda saqlanadi.
        </p>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.picker-enter-active,
.picker-leave-active {
  transition: all 0.2s ease;
}

.picker-enter-from,
.picker-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Strip the native chrome so the swatch fills the whole field. */
.color-field::-webkit-color-swatch-wrapper {
  padding: 2px;
}

.color-field::-webkit-color-swatch {
  border: none;
  border-radius: 0.375rem;
}

.color-field::-moz-color-swatch {
  border: none;
  border-radius: 0.375rem;
}
</style>
