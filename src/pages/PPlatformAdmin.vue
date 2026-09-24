<script setup lang="ts">
import { ref } from "vue"
import { useHead } from "@unhead/vue"
import { useRoute } from "vue-router"
import CAdminOverview from "@/features/platform-admin/ui/CAdminOverview.vue"
import CAdminUsers from "@/features/platform-admin/ui/CAdminUsers.vue"
import CAdminCatalog from "@/features/platform-admin/ui/CAdminCatalog.vue"
import PRagAdmin from "./PRagAdmin.vue"

useHead({ title: "Platform admin — Do'ppi AI" })
const route = useRoute()
const tab = ref(route.query.tab === "rag" ? "rag" : "overview")
const panels = [
  { key: "overview", label: "Umumiy" },
  { key: "users", label: "Foydalanuvchilar" },
  { key: "pricing", label: "Kredit va tariflar" },
  { key: "rag", label: "RAG sozlamalari" },
]
</script>

<template>
  <main class="space-y-6 pb-10">
    <header>
      <p class="text-xs font-bold uppercase tracking-[0.16em] text-[#898994]">
        Do'ppi AI · Boshqaruv
      </p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight text-[#23232B]">
        Platform admin
      </h1>
      <p class="mt-2 text-sm text-[#7B7B87]">
        Foydalanuvchilar, kredit siyosati va xizmat sozlamalari bir joyda.
      </p>
    </header>
    <nav class="flex flex-wrap gap-2" aria-label="Admin bo‘limlari">
      <button
        v-for="item in panels"
        :key="item.key"
        class="rounded-xl px-4 py-2 text-sm font-semibold transition"
        :class="
          tab === item.key
            ? 'bg-[#202026] text-white'
            : 'border border-[#E3E3E8] bg-white text-[#62626F] hover:bg-[#F3F3F5]'
        "
        @click="tab = item.key"
      >
        {{ item.label }}
      </button>
    </nav>
    <CAdminOverview v-if="tab === 'overview'" />
    <CAdminUsers v-else-if="tab === 'users'" />
    <CAdminCatalog v-else-if="tab === 'pricing'" />
    <PRagAdmin v-else-if="tab === 'rag'" />
  </main>
</template>
