import { useI18n } from "vue-i18n"
import { formatMonthName, formatShortDate } from "@/shared/lib"

/** Plan and video labels built from ISO dates, in the interface language. */
export function useVideoLabels() {
  const { t, locale } = useI18n()

  /** "September · week 3" for the week that `date` falls in. */
  const period = (date: string, week: number) =>
    t("dashboard.video.period", {
      month: formatMonthName(date, locale.value),
      week,
    })

  /** "12 Sep". */
  const day = (date: string) => formatShortDate(date, locale.value)

  /** "12 Sep · 18:00". */
  const dayTime = (date: string, time: string) =>
    t("dashboard.video.dateTime", { date: day(date), time })

  return { period, day, dayTime }
}
