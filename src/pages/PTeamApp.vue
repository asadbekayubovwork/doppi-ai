<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue"
import { useHead } from "@unhead/vue"
import { messageForProblem, useAuthStore } from "@/features/auth"
import { workspaceApi, type Membership } from "@/features/workspace"
import { useToast } from "@/shared/lib"

const auth = useAuthStore()
const toast = useToast()
const members = ref<Membership[]>([])
const email = ref("")
const role = ref<Membership["role"]>("member")
const invitationLink = ref("")
const loading = ref(false)
const businessId = computed(() => auth.activeBusinessId)
const canManage = computed(() =>
  ["owner", "admin"].includes(auth.activeBusiness?.role || "")
)

useHead({ title: "Jamoa — Do'ppi AI" })

const fail = (value: unknown, title: string, fallback: string) => {
  toast.error(title, messageForProblem(value, fallback))
}

const loadMembers = async () => {
  if (!businessId.value) return
  loading.value = true
  try {
    members.value = await workspaceApi.listMembers(businessId.value)
  } catch (value) {
    fail(value, "Jamoani yuklab bo'lmadi", "Sahifani yangilang.")
  } finally {
    loading.value = false
  }
}

const invite = async () => {
  if (!businessId.value) return
  loading.value = true
  invitationLink.value = ""
  try {
    const invitation = await workspaceApi.inviteMember(businessId.value, {
      email: email.value.trim(),
      role: role.value,
    })
    invitationLink.value = `${window.location.origin}/invitations/${invitation.token}`
    toast.success("Taklif yaratildi", email.value.trim())
    email.value = ""
  } catch (value) {
    fail(value, "Taklif yaratib bo'lmadi", "Email va rolni tekshirib ko'ring.")
  } finally {
    loading.value = false
  }
}

const updateRole = async (member: Membership, nextRole: Membership["role"]) => {
  if (!businessId.value || member.role === nextRole) return
  try {
    const updated = await workspaceApi.updateMember(
      businessId.value,
      member.user_id,
      nextRole
    )
    members.value = members.value.map((item) =>
      item.user_id === updated.user_id ? updated : item
    )
    toast.success("Rol yangilandi")
  } catch (value) {
    fail(value, "Rolni yangilab bo'lmadi", "Qayta urinib ko'ring.")
    await loadMembers()
  }
}

const remove = async (member: Membership) => {
  if (
    !businessId.value ||
    !window.confirm("Bu a'zoni jamoadan olib tashlaysizmi?")
  )
    return
  try {
    await workspaceApi.removeMember(businessId.value, member.user_id)
    members.value = members.value.filter(
      (item) => item.user_id !== member.user_id
    )
    toast.success("A'zo jamoadan olib tashlandi")
  } catch (value) {
    fail(value, "A'zoni olib tashlab bo'lmadi", "Qayta urinib ko'ring.")
  }
}

const copyInvitation = async () => {
  try {
    await navigator.clipboard.writeText(invitationLink.value)
    toast.success("Taklif havolasi nusxalandi")
  } catch {
    toast.error("Nusxalab bo'lmadi", "Havolani qo'lda belgilab nusxalang.")
  }
}

watch(businessId, loadMembers)
onMounted(loadMembers)
</script>

<template>
  <div class="grid gap-5">
    <section
      v-if="canManage"
      class="rounded-2xl border border-[#E5E5E1] bg-white p-5"
    >
      <h2 class="text-lg font-semibold text-[#15151B]">
        Jamoaga taklif qilish
      </h2>
      <p class="mt-1 text-sm text-[#6A6A74]">
        Taklif aynan ko'rsatilgan email manzilidagi hisob uchun amal qiladi.
      </p>
      <form
        class="mt-5 grid gap-3 md:grid-cols-[1fr_180px_auto]"
        @submit.prevent="invite"
      >
        <input
          v-model="email"
          required
          type="email"
          autocomplete="email"
          placeholder="hamkasb@kompaniya.uz"
          class="h-11 rounded-[10px] border border-[#D6D6D1] px-3 outline-none focus:border-[#5B4BE8]"
        />
        <select
          v-model="role"
          class="h-11 rounded-[10px] border border-[#D6D6D1] px-3"
        >
          <option value="admin">Administrator</option>
          <option value="member">A'zo</option>
          <option value="viewer">Kuzatuvchi</option>
        </select>
        <button
          :disabled="loading"
          class="h-11 rounded-[10px] bg-[#5B4BE8] px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          Taklif yaratish
        </button>
      </form>
      <div
        v-if="invitationLink"
        class="mt-4 rounded-xl border border-[#CFC7FF] bg-[#F3F0FE] p-4"
      >
        <p class="text-sm font-medium text-[#4B21C4]">
          Taklif havolasi bir marta ko'rsatiladi
        </p>
        <div class="mt-2 flex gap-2">
          <input
            readonly
            :value="invitationLink"
            class="h-10 min-w-0 flex-1 rounded-lg border border-[#D8D1FA] bg-white px-3 text-xs"
          /><button
            class="h-10 rounded-lg bg-[#5B4BE8] px-4 text-sm font-semibold text-white"
            @click="copyInvitation"
          >
            Nusxalash
          </button>
        </div>
      </div>
    </section>

    <section
      class="overflow-hidden rounded-2xl border border-[#E5E5E1] bg-white"
    >
      <div class="border-b border-[#E5E5E1] p-5">
        <h2 class="text-lg font-semibold text-[#15151B]">Jamoa a'zolari</h2>
        <p class="mt-1 text-sm text-[#6A6A74]">
          Faol biznesga tegishli a'zolar va rollar.
        </p>
      </div>
      <p v-if="loading && !members.length" class="p-5 text-sm text-[#6A6A74]">
        Yuklanmoqda...
      </p>
      <div v-else class="divide-y divide-[#E5E5E1]">
        <div
          v-for="member in members"
          :key="member.user_id"
          class="flex flex-wrap items-center gap-3 p-4 sm:flex-nowrap"
        >
          <span
            class="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#F3F0FE] text-sm font-semibold text-[#5B4BE8]"
            >{{ member.user_id.slice(0, 2).toUpperCase() }}</span
          >
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-[#15151B]">
              {{ member.user_id === auth.user?.id ? "Siz" : member.user_id }}
            </p>
            <p class="text-xs text-[#84848E]">
              {{ new Date(member.joined_at).toLocaleDateString("uz-UZ") }}
            </p>
          </div>
          <select
            :value="member.role"
            :disabled="!canManage"
            class="h-10 rounded-[10px] border border-[#D6D6D1] px-3 text-sm disabled:bg-[#FAFAF9]"
            @change="
              updateRole(
                member,
                ($event.target as HTMLSelectElement).value as Membership['role']
              )
            "
          >
            <option value="owner">Egasi</option>
            <option value="admin">Administrator</option>
            <option value="member">A'zo</option>
            <option value="viewer">Kuzatuvchi</option>
          </select>
          <button
            v-if="canManage && member.user_id !== auth.user?.id"
            class="h-10 rounded-[10px] border border-[#E7B8B8] px-3 text-sm text-[#C42B2B]"
            @click="remove(member)"
          >
            Olib tashlash
          </button>
        </div>
        <p v-if="!members.length" class="p-5 text-sm text-[#84848E]">
          Jamoa a'zolari topilmadi.
        </p>
      </div>
    </section>
  </div>
</template>
