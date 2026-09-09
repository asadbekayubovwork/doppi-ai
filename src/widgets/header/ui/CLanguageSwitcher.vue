<script setup lang="ts">
import { ref, computed, onMounted } from "vue"
import { useI18n } from "vue-i18n"

interface Language {
  code: string
  name: string
  flag: string
}

const { locale } = useI18n()

const languages: Language[] = [
  { code: "en", name: "English", flag: "🇺🇸" },
  { code: "uz", name: "Uzbek", flag: "🇺🇿" },
  { code: "ru", name: "Russian", flag: "🇷🇺" },
]

const selectedLanguage = ref<Language>(languages[0])
const isOpen = ref(false)

const currentLanguageDisplay = computed(() => {
  return selectedLanguage.value.code.slice(0, 3)
})

const openDropdown = () => {
  isOpen.value = true
}

const closeDropdown = () => {
  isOpen.value = false
}

const selectLanguage = (language: Language) => {
  selectedLanguage.value = language
  locale.value = language.code
  // Save to localStorage
  localStorage.setItem("locale", language.code)
  closeDropdown()
}

// Initialize selected language from current locale
onMounted(() => {
  const currentLocale = locale.value
  const currentLang = languages.find((lang) => lang.code === currentLocale)
  if (currentLang) {
    selectedLanguage.value = currentLang
  }
})
</script>

<template>
  <div class="relative" @mouseenter="openDropdown" @mouseleave="closeDropdown">
    <button
      class="flex items-center gap-1 px-3 py-2 text-white transition-colors"
    >
      <span class="font-medium capitalize">{{ currentLanguageDisplay }}</span>
      <svg
        class="w-4 h-4 transition-transform"
        :class="{ 'rotate-180': isOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <Transition name="dropdown">
      <div v-if="isOpen" class="absolute top-full right-0 z-50 dropdown">
        <div
          class="w-[140px] bg-[#1C132C] mt-2 rounded-xl shadow-xl overflow-hidden"
        >
          <button
            v-for="language in languages"
            :key="language.code"
            @click="selectLanguage(language)"
            class="w-full text-left px-4 py-3 text-xs text-[#FCFCFC] hover:bg-[#6633EE]/20 transition-colors flex items-center justify-between"
            :class="{
              'text-[#6633EE]': selectedLanguage.code === language.code,
            }"
          >
            <span>{{ language.name }}</span>
            <svg
              v-if="selectedLanguage.code === language.code"
              class="w-4 h-4 text-[#6633EE]"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fill-rule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clip-rule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.dropdown {
  box-shadow: 0px 2px 4px -2px #ffffff0f;
}
</style>
