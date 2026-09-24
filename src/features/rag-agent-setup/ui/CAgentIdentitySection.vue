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
    :title="$t('dashboard.rag.identity.title')"
    :hint="$t('dashboard.rag.identity.hint')"
  >
    <template v-if="$slots.aside" #aside><slot name="aside" /></template>
    <div class="grid gap-4 md:grid-cols-2">
      <CTextField
        v-model="name"
        :label="$t('dashboard.rag.identity.name')"
        :placeholder="$t('dashboard.rag.identity.namePlaceholder')"
        :maxlength="60"
      />
      <CTextField
        v-model="description"
        :label="$t('dashboard.rag.identity.description')"
        :placeholder="$t('dashboard.rag.identity.descriptionPlaceholder')"
        :maxlength="140"
      />
    </div>
  </CSetupSection>
</template>
