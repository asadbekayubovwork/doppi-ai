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
