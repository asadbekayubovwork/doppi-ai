import {
  formatDayLabel,
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
