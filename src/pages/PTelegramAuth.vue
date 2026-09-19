<script setup lang="ts">
import { computed } from "vue"
import { useRoute } from "vue-router"
import { AuthShell } from "@/features/auth"

const route = useRoute()
const challengeId = computed(() =>
  typeof route.query.challenge_id === "string" ? route.query.challenge_id : ""
)
</script>

<template>
  <AuthShell>
    <h1 class="text-[28px] font-semibold tracking-[-0.8px] text-[#15151B]">
      Telegram orqali kirish
    </h1>
    <p class="mt-2 text-[13.5px] leading-6 text-[#6A6A74]">
      {{
        challengeId
          ? "Telegram hisobingizni ulash uchun avval email bilan kiring."
          : "Telegram orqali kirish tez orada ishga tushadi."
      }}
    </p>
    <RouterLink
      to="/login"
      class="mt-6 flex h-11 items-center justify-center rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white hover:bg-[#4F40D4]"
      >Kirishga qaytish</RouterLink
    >
  </AuthShell>
</template>
