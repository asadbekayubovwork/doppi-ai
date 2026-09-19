<script setup lang="ts">
import { CTextField } from "@/shared/ui"
import CSetupSection from "./CSetupSection.vue"

defineProps<{ icon?: string }>()

const name = defineModel<string>("name", { required: true })
const description = defineModel<string>("description", { required: true })
</script>

<template>
  <CSetupSection
    :step="1"
    :icon="icon"
    title="Agent name"
    hint="Shown to your team, not to customers"
  >
    <template v-if="$slots.aside" #aside><slot name="aside" /></template>
    <div class="grid gap-4 md:grid-cols-2">
      <CTextField
        v-model="name"
        label="RAG agent name"
        placeholder="Aura Support Agent"
        :maxlength="60"
      />
      <CTextField
        v-model="description"
        label="Short description"
        placeholder="Answers product, pricing and delivery questions"
        :maxlength="140"
      />
    </div>
  </CSetupSection>
</template>
