import en from "./en.json"
import ru from "./ru.json"
import uz from "./uz.json"

export const messages = {
  en,
  ru,
  uz,
}

export const defaultLocale = "uz"
export const availableLocales = Object.keys(messages)

/** Where the chosen interface language is remembered between visits. */
export const LOCALE_STORAGE_KEY = "locale"
