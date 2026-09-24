import {
  formatCount,
  formatDate,
  formatDayLabel,
  formatDayRange,
  formatMonthName,
  formatShortDate,
  formatWeekdays,
  formatDuration,
  formatFileSize,
  formatPercent,
  formatTimeAgo,
} from "../formatters"

const NOW = new Date("2026-09-16T14:20:00").getTime()
const minutesBefore = (minutes: number) => new Date(NOW - minutes * 60_000)

describe("dashboard formatters", () => {
  it("prints compact ages for tables", () => {
    expect(formatTimeAgo(minutesBefore(0.5), NOW)).toBe("now")
    expect(formatTimeAgo(minutesBefore(18), NOW)).toBe("18 min")
    expect(formatTimeAgo(minutesBefore(125), NOW)).toBe("2 h")
    expect(formatTimeAgo(minutesBefore(60 * 50), NOW)).toBe("2 d")
  })

  it("signs growth only when asked, and keeps one decimal", () => {
    expect(formatPercent(0.942)).toBe("94.2%")
    expect(formatPercent(0.124, true)).toBe("+12.4%")
    expect(formatPercent(-0.009, true)).toBe("-0.9%")
  })

  it("sizes files the way upload rows show them", () => {
    expect(formatFileSize(320 * 1024)).toBe("320 KB")
    expect(formatFileSize(1.1 * 1024 * 1024)).toBe("1.1 MB")
    expect(formatFileSize(12.4 * 1024 * 1024)).toBe("12.4 MB")
    expect(formatFileSize(512)).toBe("512 B")
  })

  it("labels days relative to now", () => {
    const now = new Date(NOW)
    expect(formatDayLabel(minutesBefore(30), now)).toBe("Today")
    expect(formatDayLabel(minutesBefore(24 * 60), now)).toBe("Yesterday")
    expect(formatDayLabel(new Date("2026-09-02T10:00:00"), now)).toBe("2 Sep")
  })

  it("spells out durations past an hour", () => {
    expect(formatDuration(minutesBefore(18), new Date(NOW))).toBe("18 min")
    expect(formatDuration(minutesBefore(125), new Date(NOW))).toBe("2 h 05 min")
  })
})

describe("dashboard formatters in other languages", () => {
  it("speaks Uzbek and Russian when asked", () => {
    const now = new Date(NOW)
    expect(formatTimeAgo(minutesBefore(18), NOW, "uz")).toBe("18 daq")
    expect(formatTimeAgo(minutesBefore(125), NOW, "ru")).toBe("2 ч")
    expect(formatDayLabel(minutesBefore(24 * 60), now, "uz")).toBe("Kecha")
    expect(formatDayLabel(new Date("2026-09-02T10:00:00"), now, "uz")).toBe("2 sen")
    expect(formatDuration(minutesBefore(125), now, "ru")).toBe("2 ч 05 мин")
  })

  it("prints calendar dates with the year", () => {
    expect(formatDate(new Date("2026-09-02T10:00:00"), "uz")).toBe("2 sen 2026")
    expect(formatDate(new Date("2026-09-02T10:05:00"), "en", { withTime: true })).toBe(
      "2 Sep 2026 · 10:05"
    )
  })

  it("groups counts the way each language does", () => {
    expect(formatCount(8942)).toBe("8,942")
    expect(formatCount(8942, "ru").replace(/\s/g, " ")).toBe("8 942")
  })
})

describe("calendar formatters", () => {
  it("names months and spans of days in each language", () => {
    expect(formatMonthName("2026-09-10", "uz", { withYear: true })).toBe("Sentabr 2026")
    expect(formatMonthName("2026-09-10", "ru")).toBe("Сентябрь")
    expect(formatShortDate("2026-08-29", "uz")).toBe("29 avg")
    expect(formatDayRange("2026-08-25", "2026-08-31", "en")).toBe("25–31 August")
    expect(formatDayRange("2026-07-28", "2026-08-03", "uz")).toBe("28 iyul–3 avgust")
    expect(formatDayRange("2026-08-25", "2026-08-31", "ru")).toBe("25–31 августа")
  })

  it("lists weekdays from Monday", () => {
    expect(formatWeekdays("uz")).toEqual(["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"])
    expect(formatWeekdays("en")[0]).toBe("Mon")
    expect(formatWeekdays("ru")[6]).toBe("Вс")
  })
})
