// src/app/providers/i18n.ts
import { createI18n } from "vue-i18n"
import {
  messages,
  pluralRules,
  defaultLocale,
  availableLocales,
  LOCALE_STORAGE_KEY,
} from "@/shared/config/i18n"

// Get saved locale from localStorage or use default. Switch it at runtime with
// `useAppLocale().setLocale`, which writes this same key.
const getSavedLocale = (): string => {
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY)
  if (savedLocale && availableLocales.includes(savedLocale)) {
    return savedLocale
  }
  return defaultLocale
}

const initialLocale = getSavedLocale()
// index.html ships `lang="uz"`; a remembered choice has to replace it.
document.documentElement.lang = initialLocale

const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: "en",
  messages,
  pluralRules,

  // Using $t and $i18n in templates globally
  globalInjection: true,
})

export { i18n }
