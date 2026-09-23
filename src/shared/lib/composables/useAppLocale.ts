import { useI18n } from "vue-i18n"
import { availableLocales, LOCALE_STORAGE_KEY } from "@/shared/config/i18n"

/**
 * The one way to switch the interface language, shared by the landing's
 * language switcher and the profile settings: updates vue-i18n, remembers the
 * choice for the next visit (the i18n provider reads it back on load) and keeps
 * `<html lang>` in step for screen readers and browser translation.
 */
export function useAppLocale() {
  const { locale } = useI18n({ useScope: "global" })

  const setLocale = (code: string) => {
    if (!availableLocales.includes(code)) return
    locale.value = code
    document.documentElement.lang = code
    try {
      localStorage.setItem(LOCALE_STORAGE_KEY, code)
    } catch {
      // Private mode or blocked storage: the switch still holds for this visit.
    }
  }

  return { locale, setLocale }
}
