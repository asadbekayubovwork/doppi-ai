<script setup lang="ts">
import { ref } from "vue"
import { usePasswordStrength } from "@/shared/lib"
import { CIcon } from "@/shared/ui"
import type { SignupPayload } from "../api/authApi"

const props = withDefaults(
  defineProps<{
    loading?: boolean
  }>(),
  { loading: false }
)

const emit = defineEmits<{
  submit: [payload: SignupPayload]
}>()

const firstName = ref("")
const lastName = ref("")
const email = ref("")
const password = ref("")
const businessName = ref("")
const showPassword = ref(false)
const { requirements, score, level } = usePasswordStrength(password)

const submit = () => {
  emit("submit", {
    email: email.value.trim(),
    password: password.value,
    first_name: firstName.value.trim(),
    last_name: lastName.value.trim(),
    business_name: businessName.value.trim(),
  })
}
</script>

<template>
  <form class="grid gap-4" @submit.prevent="submit">
    <div class="grid gap-4 sm:grid-cols-2">
      <div>
        <label
          for="register-first-name"
          class="mb-1.5 block text-xs font-medium"
          >Ism</label
        >
        <input
          id="register-first-name"
          v-model="firstName"
          required
          autocomplete="given-name"
          class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 text-base outline-none focus:border-[#5B4BE8]"
        />
      </div>
      <div>
        <label for="register-last-name" class="mb-1.5 block text-xs font-medium"
          >Familiya</label
        >
        <input
          id="register-last-name"
          v-model="lastName"
          required
          autocomplete="family-name"
          class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 text-base outline-none focus:border-[#5B4BE8]"
        />
      </div>
    </div>

    <div>
      <label for="register-email" class="mb-1.5 block text-xs font-medium"
        >Ish emaili</label
      >
      <input
        id="register-email"
        v-model="email"
        type="email"
        required
        autocomplete="email"
        class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 text-base outline-none focus:border-[#5B4BE8]"
      />
    </div>

    <div>
      <label for="register-business" class="mb-1.5 block text-xs font-medium"
        >Biznes nomi</label
      >
      <input
        id="register-business"
        v-model="businessName"
        required
        minlength="2"
        autocomplete="organization"
        class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 text-base outline-none focus:border-[#5B4BE8]"
      />
    </div>

    <div>
      <label for="register-password" class="mb-1.5 block text-xs font-medium"
        >Parol</label
      >
      <div class="relative">
        <input
          id="register-password"
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          required
          minlength="12"
          autocomplete="new-password"
          aria-describedby="register-password-hints"
          class="h-11 w-full rounded-[10px] border border-[#D6D6D1] px-3.5 pr-12 text-base outline-none focus:border-[#5B4BE8]"
        />
        <button
          type="button"
          class="absolute right-2 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-[#6A6A74] outline-none"
          :aria-label="
            showPassword ? 'Parolni yashirish' : 'Parolni ko\'rsatish'
          "
          @click="showPassword = !showPassword"
        >
          <CIcon :name="showPassword ? 'eye-off' : 'eye'" class="h-5 w-5" />
        </button>
      </div>
      <div v-if="password" class="mt-2 flex items-center gap-3">
        <span class="grid flex-1 grid-cols-4 gap-1.5" aria-hidden="true">
          <span
            v-for="segment in 4"
            :key="segment"
            class="h-1 rounded-full"
            :class="segment <= score ? level.bar : 'bg-[#E5E5E1]'"
          />
        </span>
        <span class="text-xs" :class="level.text">{{ level.label }}</span>
      </div>
      <ul id="register-password-hints" class="sr-only">
        <li v-for="item in requirements" :key="item.label">{{ item.label }}</li>
      </ul>
    </div>

    <button
      type="submit"
      :disabled="props.loading"
      class="flex h-11 items-center justify-center gap-2 rounded-[10px] bg-[#5B4BE8] text-[13.5px] font-semibold text-white hover:bg-[#4F40D4] disabled:opacity-70"
    >
      {{ props.loading ? "Kutilmoqda..." : "Hisob yaratish" }}
      <CIcon v-if="!props.loading" name="arrow-right" class="h-4 w-4" />
    </button>
  </form>
</template>
