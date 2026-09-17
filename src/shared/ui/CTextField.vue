<script setup lang="ts">
import { useId } from "vue"

withDefaults(
  defineProps<{
    label: string
    type?: "text" | "password" | "email" | "url"
    placeholder?: string
    autocomplete?: string
    maxlength?: number
    invalid?: boolean
    /** Helper line under the field; turns red while `invalid`. */
    hint?: string
  }>(),
  { type: "text", autocomplete: "off" }
)

const model = defineModel<string>({ default: "" })
const id = useId()
</script>

<template>
  <div>
    <label
      :for="id"
      class="mb-1.5 block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#84848E]"
    >
      {{ label }}
    </label>
    <div class="relative">
      <input
        :id="id"
        v-model="model"
        :type="type"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :maxlength="maxlength"
        :aria-invalid="invalid || undefined"
        :aria-describedby="hint ? `${id}-hint` : undefined"
        spellcheck="false"
        class="h-9 w-full rounded-[10px] border bg-white px-3 text-[13px] text-[#15151B] outline-none transition placeholder:text-[#A1A1AA] focus:ring-2"
        :class="[
          invalid
            ? 'border-[#E7B8B8] focus:border-[#C42B2B] focus:ring-[#C42B2B]/15'
            : 'border-[#E5E5E1] focus:border-[#5B4BE8] focus:ring-[#5B4BE8]/15',
          $slots.suffix ? 'pr-10' : '',
        ]"
      />
      <div
        v-if="$slots.suffix"
        class="absolute inset-y-0 right-1.5 flex items-center gap-1"
      >
        <slot name="suffix" />
      </div>
    </div>
    <p
      v-if="hint"
      :id="`${id}-hint`"
      class="mt-1 text-xs"
      :class="invalid ? 'text-[#C42B2B]' : 'text-[#84848E]'"
    >
      {{ hint }}
    </p>
  </div>
</template>
