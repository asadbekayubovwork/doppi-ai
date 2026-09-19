<script setup lang="ts">
import { computed, ref } from "vue"
import { CIcon, CTextField } from "@/shared/ui"
import type { CredentialField } from "../model/channel-setup"

const props = defineProps<{
  field: CredentialField
  /** Overrides the field's example value. */
  placeholder?: string
}>()

const value = defineModel<string>({ default: "" })

const isRevealed = ref(false)
const isValid = computed(() => props.field.isValid(value.value))
// Stay quiet until there is something to judge.
const isInvalid = computed(() => value.value.trim() !== "" && !isValid.value)
</script>

<template>
  <CTextField
    v-model="value"
    :label="field.label"
    :type="field.secret && !isRevealed ? 'password' : 'text'"
    :placeholder="placeholder ?? field.placeholder"
    :autocomplete="field.secret ? 'new-password' : 'off'"
    :invalid="isInvalid"
    :hint="isInvalid ? field.invalidHint : undefined"
  >
    <!-- Secrets get a reveal toggle; plain values a check once they are valid. -->
    <template v-if="field.secret || isValid" #suffix>
      <button
        v-if="field.secret"
        type="button"
        class="flex h-7 w-7 items-center justify-center rounded-md text-[#84848E] transition hover:bg-[#F2F2EF] hover:text-[#15151B]"
        :aria-label="`${isRevealed ? 'Hide' : 'Show'} ${field.label.toLowerCase()}`"
        :aria-pressed="isRevealed"
        @click="isRevealed = !isRevealed"
      >
        <CIcon :name="isRevealed ? 'eye' : 'eye-off'" class="h-4 w-4" />
      </button>
      <CIcon v-else name="check" class="mr-1.5 h-4 w-4 text-[#177A46]" />
    </template>
  </CTextField>
</template>
