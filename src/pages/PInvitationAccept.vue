<script setup lang="ts">
import { onMounted, ref } from "vue"
import { useHead } from "@unhead/vue"
import { useRoute, useRouter } from "vue-router"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { workspaceApi } from "@/features/workspace"

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const status = ref<"loading" | "success" | "error">("loading")
const message = ref("Taklif tekshirilmoqda...")

useHead({ title: "Jamoa taklifi — Do'ppi AI" })

onMounted(async () => {
  try {
    await workspaceApi.acceptInvitation(String(route.params.token || ""))
    await auth.loadBusinesses()
    status.value = "success"
    message.value = "Taklif qabul qilindi. Ish maydoni tayyor."
  } catch (error) {
    status.value = "error"
    message.value = messageForProblem(
      error,
      "Taklif yaroqsiz yoki muddati tugagan."
    )
  }
})
</script>

<template>
  <main class="grid min-h-screen place-items-center bg-[#F8F8F6] p-5">
    <section
      class="w-full max-w-md rounded-2xl border border-[#E5E5E1] bg-white p-7 text-center shadow-sm"
    >
      <div
        class="mx-auto grid h-12 w-12 place-items-center rounded-full"
        :class="
          status === 'error'
            ? 'bg-[#FFF0F0] text-[#C42B2B]'
            : 'bg-[#F3F0FE] text-[#5B4BE8]'
        "
      >
        {{ status === "loading" ? "…" : status === "success" ? "✓" : "!" }}
      </div>
      <h1 class="mt-4 text-xl font-semibold text-[#15151B]">Jamoa taklifi</h1>
      <p
        class="mt-2 text-sm leading-6 text-[#6A6A74]"
        :role="status === 'error' ? 'alert' : 'status'"
      >
        {{ message }}
      </p>
      <button
        v-if="status !== 'loading'"
        class="mt-6 h-11 w-full rounded-[10px] bg-[#5B4BE8] text-sm font-semibold text-white"
        @click="router.replace('/app/rag')"
      >
        Ish maydoniga o'tish
      </button>
    </section>
  </main>
</template>
