import { useI18n } from "vue-i18n"
import { formatCount } from "../formatters"

/**
 * Counted nouns in the interface language: `count("dashboard.plural.documents", 3)`
 * gives "3 documents", "3 ta hujjat" or "3 документа". The message receives the
 * number already grouped for the locale as `{count}`.
 */
export function useCountLabel() {
  const { t, locale } = useI18n()
  return (key: string, value: number) =>
    t(key, { count: formatCount(value, locale.value) }, value)
}
