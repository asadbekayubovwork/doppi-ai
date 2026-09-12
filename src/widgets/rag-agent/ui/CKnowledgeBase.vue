<script setup lang="ts">
import { CIcon } from "@/shared/ui"
import { knowledgeDocuments } from "../model/data"
</script>

<template>
  <section class="rounded-2xl border border-[#E5E5EA] bg-white shadow-[0_1px_2px_rgba(18,18,28,0.02)]">
    <header class="flex items-center justify-between border-b border-[#E8E8ED] px-5 py-4"><h2 class="text-lg font-bold text-[#22222A]">Knowledge base</h2><button type="button" class="inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#E3E2E8] px-2.5 text-xs font-semibold text-[#6E6C77]"><CIcon name="upload" class="h-3.5 w-3.5" />Upload</button></header>
    <div class="space-y-3 p-5">
      <article v-for="document in knowledgeDocuments" :key="document.name" class="flex min-w-0 items-center gap-3"><span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0EDFF] text-[#7058EE]"><CIcon :name="document.type" class="h-5 w-5" /></span><div class="min-w-0 flex-1"><h3 class="truncate text-sm font-semibold text-[#44434C]">{{ document.name }}</h3><p class="text-xs text-[#9795A0]">{{ document.meta }}</p></div><span class="rounded-full px-2 py-1 text-xs font-semibold" :class="document.status === 'Indexed' ? 'bg-[#E7F6EE] text-[#218658]' : 'bg-[#FFF1DF] text-[#CC741C]'">{{ document.status }}</span></article>
      <button type="button" class="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#DDDCE3] text-sm font-medium text-[#777583] transition hover:bg-[#FAFAFC]"><CIcon name="cloud-upload" class="h-5 w-5" />Upload PDF, DOCX, XLSX, TXT or a URL</button>
    </div>
  </section>
</template>
