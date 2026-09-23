import { computed, type ComputedRef } from "vue"
import { useI18n } from "vue-i18n"

type Raw = unknown

/**
 * Reads an ARRAY from the i18n message tree (e.g. `features.items`) and resolves
 * every leaf into a plain string.
 *
 * `tm()` returns compiled message functions rather than strings, so each leaf
 * has to go through `rt()`. Nested arrays/objects are resolved recursively, so
 * a tier with a `features: []` array comes back fully usable in a template.
 */
export function useI18nList<T = Record<string, string>>(
  key: string
): ComputedRef<T[]> {
  const { tm, rt, locale } = useI18n()

  const resolve = (value: Raw): unknown => {
    if (Array.isArray(value)) return value.map(resolve)
    if (value && typeof value === "object") {
      // A compiled message is an object too, but `rt` is what turns it into a
      // string; plain content nodes are indexable records.
      const record = value as Record<string, unknown>
      const isMessageNode = typeof record.type === "number" || "body" in record
      if (isMessageNode) return rt(value as never)
      return Object.fromEntries(
        Object.entries(record).map(([k, v]) => [k, resolve(v)])
      )
    }
    if (typeof value === "function") return rt(value as never)
    return value
  }

  return computed<T[]>(() => {
    // Touch the locale so the list recomputes on language switch.
    void locale.value
    const raw = tm(key) as Raw
    if (!Array.isArray(raw)) return []
    return raw.map((entry) => resolve(entry)) as T[]
  })
}
