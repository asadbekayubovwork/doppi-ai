/**
 * Formats a raw Uzbekistan phone number string into a more readable format.
 * @param phoneNumber The raw phone number string.
 * @returns The formatted phone number string.
 */
export function formatPhoneNumber(phoneNumber: string): string {
  const cleaned = phoneNumber.replace(/\D/g, "") // Remove non-digits

  // Expecting 12 digits: 998XXYYYZZWW
  const match = cleaned.match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/)

  if (match) {
    return `+998 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`
  }

  // Return original if it doesn't match expected pattern
  return phoneNumber
}

/**
 * Formats number with thousand separators.
 * @param price The price number.
 * @returns The formatted price string.
 */
export function formatNumber(price: number): string {
  return price.toLocaleString("ru-RU")
}

/** Interface languages the dashboard formats for; anything else reads as English. */
export type FormatLocale = "uz" | "en" | "ru"

const INTL_TAGS: Record<FormatLocale, string> = {
  uz: "uz-UZ",
  // en-GB abbreviates September as "Sept" in recent ICU; en-US keeps "Sep".
  en: "en-US",
  ru: "ru-RU",
}

const UNITS: Record<
  FormatLocale,
  { now: string; min: string; h: string; d: string; today: string; yesterday: string }
> = {
  uz: { now: "hozir", min: "daq", h: "soat", d: "kun", today: "Bugun", yesterday: "Kecha" },
  en: { now: "now", min: "min", h: "h", d: "d", today: "Today", yesterday: "Yesterday" },
  ru: { now: "сейчас", min: "мин", h: "ч", d: "дн", today: "Сегодня", yesterday: "Вчера" },
}

// Spelled out rather than Intl "uz-UZ": Chrome's ICU has no Uzbek month
// abbreviations and prints "M09 19".
const UZ_MONTHS = ["yan", "fev", "mar", "apr", "may", "iyn", "iyl", "avg", "sen", "okt", "noy", "dek"]

const UZ_MONTHS_LONG = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"]
const UZ_WEEKDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

const asLocale = (locale: string): FormatLocale =>
  locale === "uz" || locale === "ru" ? locale : "en"

const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
})

const MINUTE_MS = 60_000

/** 8942 → "8,942" in English, "8 942" in Uzbek and Russian. */
export function formatCount(value: number, locale = "en"): string {
  return new Intl.NumberFormat(INTL_TAGS[asLocale(locale)]).format(value)
}

/** 0.942 → "94.2%"; `signed` marks growth explicitly: 0.124 → "+12.4%". */
export function formatPercent(ratio: number, signed = false): string {
  const value = `${Number((ratio * 100).toFixed(1))}%`
  return signed && ratio > 0 ? `+${value}` : value
}

/** Compact age for dense lists: "now", "18 min", "4 h", "2 d". */
export function formatTimeAgo(
  date: string | Date,
  now = Date.now(),
  locale = "en"
): string {
  const units = UNITS[asLocale(locale)]
  const minutes = Math.floor((now - new Date(date).getTime()) / MINUTE_MS)
  if (minutes < 1) return units.now
  if (minutes < 60) return `${minutes} ${units.min}`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ${units.h}`
  return `${Math.floor(hours / 24)} ${units.d}`
}

/** 24-hour wall clock: "14:02". */
export function formatClockTime(date: string | Date): string {
  return clockFormat.format(new Date(date))
}

/** Day and short month: "12 Sep", "12 sen", "12 сент.". */
function formatDayMonth(day: Date, locale: FormatLocale): string {
  if (locale === "uz") return `${day.getDate()} ${UZ_MONTHS[day.getMonth()]}`
  const month = new Intl.DateTimeFormat(INTL_TAGS[locale], { month: "short" })
  return `${day.getDate()} ${month.format(day)}`
}

/** Day and short month without the year: "12 Sep", "12 sen", "12 сент.". */
export function formatShortDate(date: string | Date, locale = "en"): string {
  return formatDayMonth(new Date(date), asLocale(locale))
}

/** The month on its own, "September", "Sentabr", "Сентябрь"; optionally with the year. */
export function formatMonthName(
  date: string | Date,
  locale = "en",
  { withYear = false }: { withYear?: boolean } = {}
): string {
  const day = new Date(date)
  const lang = asLocale(locale)
  const month =
    lang === "uz"
      ? UZ_MONTHS_LONG[day.getMonth()]
      : capitalize(
          new Intl.DateTimeFormat(INTL_TAGS[lang], { month: "long" }).format(day)
        )
  return withYear ? `${month} ${day.getFullYear()}` : month
}

/** Day and full month, the way a range reads: "31 August", "31 avgust", "31 августа". */
function formatDayMonthLong(day: Date, locale: FormatLocale): string {
  if (locale === "uz")
    return `${day.getDate()} ${UZ_MONTHS_LONG[day.getMonth()].toLowerCase()}`
  const tag = locale === "en" ? "en-GB" : INTL_TAGS[locale]
  return new Intl.DateTimeFormat(tag, { day: "numeric", month: "long" }).format(day)
}

/** A span of days: "25–31 August", "28 July–3 August" (and their translations). */
export function formatDayRange(
  start: string | Date,
  end: string | Date,
  locale = "en"
): string {
  const lang = asLocale(locale)
  const from = new Date(start)
  const to = new Date(end)
  const sameMonth =
    from.getMonth() === to.getMonth() && from.getFullYear() === to.getFullYear()
  const head = sameMonth ? String(from.getDate()) : formatDayMonthLong(from, lang)
  return `${head}–${formatDayMonthLong(to, lang)}`
}

/** Short weekday names, Monday first: "Mon"…"Sun", "Du"…"Ya", "Пн"…"Вс". */
export function formatWeekdays(locale = "en"): string[] {
  const lang = asLocale(locale)
  if (lang === "uz") return [...UZ_WEEKDAYS]
  const format = new Intl.DateTimeFormat(INTL_TAGS[lang], { weekday: "short" })
  // 2024-01-01 was a Monday.
  return Array.from({ length: 7 }, (_, index) =>
    capitalize(format.format(new Date(2024, 0, 1 + index)))
  )
}

/** "Today", "Yesterday" or a short date such as "12 Sep". */
export function formatDayLabel(
  date: string | Date,
  now = new Date(),
  locale = "en"
): string {
  const lang = asLocale(locale)
  const day = new Date(date)
  const startOf = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const daysAgo = Math.round(
    (startOf(now) - startOf(day)) / (24 * 60 * MINUTE_MS)
  )
  if (daysAgo === 0) return UNITS[lang].today
  if (daysAgo === 1) return UNITS[lang].yesterday
  return formatDayMonth(day, lang)
}

/** Calendar date with the year, "12 Sep 2026"; `withTime` adds "· 14:02". */
export function formatDate(
  date: string | Date,
  locale = "en",
  { withTime = false }: { withTime?: boolean } = {}
): string {
  const day = new Date(date)
  const text = `${formatDayMonth(day, asLocale(locale))} ${day.getFullYear()}`
  return withTime ? `${text} · ${formatClockTime(day)}` : text
}

/** Elapsed time between two instants: "18 min", "2 h 05 min". */
export function formatDuration(
  from: string | Date,
  to: string | Date,
  locale = "en"
): string {
  const units = UNITS[asLocale(locale)]
  const minutes = Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / MINUTE_MS)
  )
  if (minutes < 60) return `${minutes} ${units.min}`
  const rest = String(minutes % 60).padStart(2, "0")
  return `${Math.floor(minutes / 60)} ${units.h} ${rest} ${units.min}`
}

/** Binary units, one decimal below 100: "320 KB", "1.1 MB", "12.4 MB". */
export function formatFileSize(bytes: number): string {
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  const rounded = value < 100 ? Number(value.toFixed(1)) : Math.round(value)
  return `${rounded} ${units[unit]}`
}
