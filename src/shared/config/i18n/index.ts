import en from "./en.json"
import ru from "./ru.json"
import uz from "./uz.json"

export const messages = {
  en,
  ru,
  uz,
}

/**
 * Russian nouns take three forms after a number: "1 файл", "2 файла",
 * "5 файлов" — so its plural messages list three choices. Uzbek keeps one
 * form and English two, which vue-i18n's default rule already handles.
 */
export const pluralRules = {
  ru: (choice: number, choicesLength: number) => {
    const n = Math.abs(choice) % 100
    const last = n % 10
    const form =
      n > 10 && n < 20 ? 2 : last === 1 ? 0 : last >= 2 && last <= 4 ? 1 : 2
    return Math.min(form, choicesLength - 1)
  },
}

export const defaultLocale = "uz"
export const availableLocales = Object.keys(messages)

/** Where the chosen interface language is remembered between visits. */
export const LOCALE_STORAGE_KEY = "locale"
