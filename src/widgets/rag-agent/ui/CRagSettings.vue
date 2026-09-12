<script setup lang="ts">
import { ref } from "vue"
import { CIcon } from "@/shared/ui"

const isEditing = ref(false)
const prompt = ref("You are Aura, the support agent for Aura Store. Answer only from the knowledge base, in the language the customer writes in. Hand over to a human when the documents don't cover it.")
</script>

<template>
  <section class="rounded-2xl border border-[#E5E5EA] bg-white shadow-[0_1px_2px_rgba(18,18,28,0.02)]">
    <header class="flex items-center justify-between border-b border-[#E8E8ED] px-5 py-4"><h2 class="text-lg font-bold text-[#22222A]">Model &amp; system prompt</h2><button type="button" class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E3E2E8] px-2.5 text-xs font-semibold text-[#6E6C77]" @click="isEditing = !isEditing"><CIcon :name="isEditing ? 'check' : 'pencil'" class="h-3.5 w-3.5" />{{ isEditing ? "Save" : "Edit" }}</button></header>
    <div class="space-y-3 p-5">
      <label class="block text-xs font-bold uppercase tracking-[0.07em] text-[#92909B]">LLM model</label>
      <button type="button" class="flex h-11 w-full items-center gap-2 rounded-xl border border-[#E3E2E8] px-3 text-left"><CIcon name="cpu" class="h-5 w-5 text-[#684EF1]" /><span class="text-sm font-semibold text-[#36353F]">GPT-4o</span><span class="text-xs text-[#9694A0]">128k context</span><CIcon name="chevron-down" class="ml-auto h-4 w-4 text-[#9694A0]" /></button>
      <label for="system-prompt" class="block pt-1 text-xs font-bold uppercase tracking-[0.07em] text-[#92909B]">System prompt</label>
      <textarea id="system-prompt" v-model="prompt" :readonly="!isEditing" rows="4" class="w-full resize-none rounded-xl border border-[#E3E2E8] bg-[#FCFCFD] p-3 text-sm leading-5 text-[#777583] outline-none focus:border-[#6046E8]" />
    </div>
  </section>
</template>
