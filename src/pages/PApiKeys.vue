<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useHead } from "@unhead/vue"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { workspaceApi, type ApiKeyItem } from "@/features/workspace"
import { useToast } from "@/shared/lib"

const auth = useAuthStore()
const toast = useToast()
const keys = ref<ApiKeyItem[]>([])
const name = ref("")
const readScope = ref(true)
const writeScope = ref(false)
const oneTimeSecret = ref("")
const loading = ref(false)
const businessId = computed(() => auth.activeBusinessId)
const canManage = computed(() =>
  ["owner", "admin"].includes(auth.activeBusiness?.role || "")
)

useHead({ title: "API kalitlar — Do'ppi AI" })

const fail = (value: unknown, title: string, fallback: string) => {
  toast.error(
    title,
    messageForProblem(value, fallback, {
      STEP_UP_REQUIRED:
        "Xavfsizlik uchun Google orqali qayta kirib, amalni takrorlang.",
    })
  )
}

const loadKeys = async () => {
  if (!businessId.value || !canManage.value) return
  loading.value = true
  try {
    keys.value = await workspaceApi.listApiKeys(businessId.value)
  } catch (value) {
    fail(value, "API kalitlarni yuklab bo'lmadi", "Sahifani yangilang.")
  } finally {
    loading.value = false
  }
}

const scopes = () =>
  [readScope.value ? "read" : "", writeScope.value ? "write" : ""].filter(
    Boolean
  )

const createKey = async () => {
  if (!businessId.value || !scopes().length) return
  loading.value = true
  oneTimeSecret.value = ""
  try {
    const created = await workspaceApi.createApiKey(businessId.value, {
      name: name.value.trim(),
      scopes: scopes(),
    })
    oneTimeSecret.value = created.secret || ""
    keys.value = [created, ...keys.value]
    name.value = ""
    toast.success("API kalit yaratildi", "Secretni hoziroq nusxalab oling.")
  } catch (value) {
    fail(
      value,
      "API kalit yaratib bo'lmadi",
      "Ma'lumotlarni tekshirib ko'ring."
    )
  } finally {
    loading.value = false
  }
}

const rotate = async (item: ApiKeyItem) => {
  if (
    !businessId.value ||
    !window.confirm("Eski kalit darhol bekor qilinadi. Davom etasizmi?")
  )
    return
  try {
    const created = await workspaceApi.rotateApiKey(businessId.value, item.id)
    oneTimeSecret.value = created.secret || ""
    await loadKeys()
    toast.success("API kalit almashtirildi", "Eski kalit bekor qilindi.")
  } catch (value) {
    fail(value, "API kalitni almashtirib bo'lmadi", "Qayta urinib ko'ring.")
  }
}

const revoke = async (item: ApiKeyItem) => {
  if (!businessId.value || !window.confirm("API kalitni bekor qilasizmi?"))
    return
  try {
    await workspaceApi.revokeApiKey(businessId.value, item.id)
    await loadKeys()
    toast.success("API kalit bekor qilindi", item.name)
  } catch (value) {
    fail(value, "API kalitni bekor qilib bo'lmadi", "Qayta urinib ko'ring.")
  }
}

const copySecret = async () => {
  try {
    await navigator.clipboard.writeText(oneTimeSecret.value)
    toast.success("Secret nusxalandi")
  } catch {
    toast.error("Nusxalab bo'lmadi", "Matnni qo'lda belgilab nusxalang.")
  }
}

watch([businessId, canManage], loadKeys)
onMounted(loadKeys)
</script>

<template>
  <div class="grid gap-5">
    <p
      v-if="!canManage"
      class="rounded-2xl border border-[#E5E5E1] bg-white p-5 text-sm text-[#6A6A74]"
    >
      API kalitlarni faqat biznes egasi yoki administratori boshqara oladi.
    </p>
    <section v-else class="rounded-2xl border border-[#E5E5E1] bg-white p-5">
      <h2 class="text-lg font-semibold text-[#15151B]">Yangi API kalit</h2>
      <p class="mt-1 text-sm text-[#6A6A74]">
        Secret faqat yaratilgan yoki almashtirilgan paytda bir marta
        ko'rsatiladi.
      </p>
      <form class="mt-5 grid gap-4" @submit.prevent="createKey">
        <input
          v-model="name"
          required
          maxlength="100"
          placeholder="Masalan: Production integratsiya"
          class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        />
        <fieldset class="flex flex-wrap gap-5 text-sm">
          <legend class="mb-2 font-medium">Ruxsatlar</legend>
          <label class="flex items-center gap-2"
            ><input v-model="readScope" type="checkbox" /> O'qish</label
          ><label class="flex items-center gap-2"
            ><input v-model="writeScope" type="checkbox" /> Yozish</label
          >
        </fieldset>
        <button
          :disabled="loading || !scopes().length"
          class="h-11 rounded-[10px] bg-[#5B4BE8] px-5 text-sm font-semibold text-white disabled:opacity-60 sm:w-fit"
        >
          {{ loading ? "Yaratilmoqda..." : "API kalit yaratish" }}
        </button>
      </form>
      <div
        v-if="oneTimeSecret"
        class="mt-5 rounded-xl border border-[#F0D49A] bg-[#FFF9EA] p-4"
      >
        <p class="text-sm font-semibold text-[#7A5417]">
          Hozir nusxalang — qayta ko'rsatilmaydi
        </p>
        <div class="mt-2 flex gap-2">
          <input
            readonly
            :value="oneTimeSecret"
            class="h-10 min-w-0 flex-1 rounded-lg border border-[#E9D49E] bg-white px-3 font-mono text-xs"
          /><button
            class="h-10 rounded-lg bg-[#15151B] px-4 text-sm font-semibold text-white"
            @click="copySecret"
          >
            Nusxalash
          </button>
        </div>
      </div>
    </section>

    <section
      v-if="canManage"
      class="overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white"
    >
      <div class="border-b border-[#E5E5E1] p-5">
        <h2 class="text-lg font-semibold text-[#15151B]">API kalitlar</h2>
        <p class="mt-1 text-sm text-[#6A6A74]">
          Faol va bekor qilingan kalitlar ro'yxati.
        </p>
      </div>
      <p v-if="loading && !keys.length" class="p-5 text-sm text-[#6A6A74]">
        Yuklanmoqda...
      </p>
      <div v-else class="divide-y divide-[#E5E5E1]">
        <div
          v-for="item in keys"
          :key="item.id"
          class="flex flex-wrap items-center gap-3 p-4"
        >
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-[#15151B]">{{ item.name }}</p>
            <p class="mt-1 font-mono text-xs text-[#84848E]">
              {{ item.key_prefix }}•••• · {{ item.scopes.join(", ") }}
            </p>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-xs"
            :class="
              item.revoked_at
                ? 'bg-[#FFF0F0] text-[#C42B2B]'
                : 'bg-[#EAF8F0] text-[#177A46]'
            "
            >{{ item.revoked_at ? "Bekor qilingan" : "Faol" }}</span
          ><button
            v-if="!item.revoked_at"
            class="h-10 rounded-[10px] border border-[#D6D6D1] px-3 text-sm"
            @click="rotate(item)"
          >
            Almashtirish</button
          ><button
            v-if="!item.revoked_at"
            class="h-10 rounded-[10px] border border-[#E7B8B8] px-3 text-sm text-[#C42B2B]"
            @click="revoke(item)"
          >
            Bekor qilish
          </button>
        </div>
        <p v-if="!keys.length" class="p-5 text-sm text-[#84848E]">
          Hali API kalit yaratilmagan.
        </p>
      </div>
    </section>
  </div>
</template>
