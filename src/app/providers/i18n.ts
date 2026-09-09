// src/app/providers/i18n.ts
import { createI18n } from "vue-i18n"
import { messages, defaultLocale, availableLocales } from "@/shared/config/i18n"

// Get saved locale from localStorage or use default
const getSavedLocale = (): string => {
  const savedLocale = localStorage.getItem("locale")
  if (savedLocale && availableLocales.includes(savedLocale)) {
    return savedLocale
  }
  return defaultLocale
}

const i18n = createI18n({
  legacy: false,
  locale: getSavedLocale(),
  fallbackLocale: "en",
  messages,

  // Using $t and $i18n in templates globally
  globalInjection: true,
})

export { i18n }
