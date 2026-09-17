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

const countFormat = new Intl.NumberFormat("en-US")
const clockFormat = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  minute: "2-digit",
})
// en-GB abbreviates September as "Sept" in recent ICU; en-US keeps "Sep".
const monthFormat = new Intl.DateTimeFormat("en-US", { month: "short" })

const MINUTE_MS = 60_000

/** 8942 → "8,942", the grouping the dashboard uses for counters. */
export function formatCount(value: number): string {
  return countFormat.format(value)
}

/** 0.942 → "94.2%"; `signed` marks growth explicitly: 0.124 → "+12.4%". */
export function formatPercent(ratio: number, signed = false): string {
  const value = `${Number((ratio * 100).toFixed(1))}%`
  return signed && ratio > 0 ? `+${value}` : value
}

/** Compact age for dense lists: "now", "18 min", "4 h", "2 d". */
export function formatTimeAgo(date: string | Date, now = Date.now()): string {
  const minutes = Math.floor((now - new Date(date).getTime()) / MINUTE_MS)
  if (minutes < 1) return "now"
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} h`
  return `${Math.floor(hours / 24)} d`
}

/** 24-hour wall clock: "14:02". */
export function formatClockTime(date: string | Date): string {
  return clockFormat.format(new Date(date))
}

/** "Today", "Yesterday" or a short date such as "12 Sep". */
export function formatDayLabel(date: string | Date, now = new Date()): string {
  const day = new Date(date)
  const startOf = (value: Date) =>
    new Date(value.getFullYear(), value.getMonth(), value.getDate()).getTime()
  const daysAgo = Math.round(
    (startOf(now) - startOf(day)) / (24 * 60 * MINUTE_MS)
  )
  if (daysAgo === 0) return "Today"
  if (daysAgo === 1) return "Yesterday"
  return `${day.getDate()} ${monthFormat.format(day)}`
}

/** Elapsed time between two instants: "18 min", "2 h 05 min". */
export function formatDuration(from: string | Date, to: string | Date): string {
  const minutes = Math.max(
    0,
    Math.round((new Date(to).getTime() - new Date(from).getTime()) / MINUTE_MS)
  )
  if (minutes < 60) return `${minutes} min`
  const rest = String(minutes % 60).padStart(2, "0")
  return `${Math.floor(minutes / 60)} h ${rest} min`
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
