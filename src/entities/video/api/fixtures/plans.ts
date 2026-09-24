import type {
  CalendarDay,
  PlanHistoryEntry,
  PlanVideo,
  ScriptMessage,
  WeekPlan,
} from "../../model/types"

// Stand-in weekly plans, calendar and AI script data for the plans screen.

const doneVideos: PlanVideo[] = [
  {
    id: "p1-1",
    order: 1,
    title: "Hafta hook · brend tanishtiruv",
    brief: "3 kadr: do'kon eshigi ochilishi → barista portreti → logotip. Matn: 'Yangi hafta, yangi ta'm.'",
    platform: "instagram",
    date: "2026-09-01",
    time: "18:00",
    state: "published",
    views: "412K",
    locked: true,
    thumbnail: "#C9A98C",
  },
  {
    id: "p1-2",
    order: 2,
    title: "Mahsulot demo · latte art",
    brief: "Yaqin plan: sut quyilishi, sekin harakat. Ovoz: original audio + trend track.",
    platform: "tiktok",
    date: "2026-09-02",
    time: "12:00",
    state: "published",
    views: "386K",
    locked: true,
    thumbnail: "#D6D2CC",
  },
  {
    id: "p1-3",
    order: 3,
    title: "Mijoz sharhi · UGC",
    brief: "Mijoz intervyusi 15s, subtitrlar UZ. CTA: profil havolasi.",
    platform: "instagram",
    date: "2026-09-03",
    time: "19:00",
    state: "published",
    views: "264K",
    locked: true,
    thumbnail: "#8C6E54",
  },
  {
    id: "p1-4",
    order: 4,
    title: "Kofe tayyorlash ASMR",
    brief: "Ovoz asosiy: grinder, bug', chashka. Kadrlar 5×3s.",
    platform: "instagram",
    date: "2026-09-05",
    time: "18:30",
    state: "published",
    views: "480K",
    locked: true,
    thumbnail: "#2B3A67",
  },
  {
    id: "p1-5",
    order: 5,
    title: "Do'kon ortidagi kun",
    brief: "Timelapse: ochilishdan yopilishgacha. Xodimlar bilan qisqa dialog.",
    platform: "youtube",
    date: "2026-09-06",
    time: "13:00",
    state: "published",
    views: "198K",
    locked: true,
    thumbnail: "#E8E6E2",
  },
  {
    id: "p1-6",
    order: 6,
    title: "Hafta yakuni · CTA",
    brief: "Eng yaxshi 3 kadr montaji + chegirma e'loni. Matn overlay.",
    platform: "instagram",
    date: "2026-09-07",
    time: "20:00",
    state: "published",
    views: "160K",
    locked: true,
    thumbnail: "#B4472E",
  },
]

const ongoingVideos: PlanVideo[] = [
  {
    id: "p2-1",
    order: 1,
    title: "Hafta hook · yangi menyu",
    brief: "3 kadr: menyu taxtasi → yangi shirinlik → CTA overlay.",
    platform: "instagram",
    date: "2026-09-08",
    time: "18:00",
    state: "published",
    views: "214K",
    thumbnail: "#C9A98C",
  },
  {
    id: "p2-2",
    order: 2,
    title: "Barista challenge",
    brief: "Xodimlar o'rtasida 15s tezlik challenge, trend audio.",
    platform: "tiktok",
    date: "2026-09-09",
    time: "12:30",
    state: "published",
    views: "186K",
    thumbnail: "#2B3A67",
  },
  {
    id: "p2-3",
    order: 3,
    title: "Mijoz reaksiyasi · UGC",
    brief: "Yangi shirinlikni tatib ko'rish reaksiyalari, subtitr UZ.",
    platform: "instagram",
    date: "2026-09-10",
    time: "19:00",
    state: "published",
    views: "92K",
    thumbnail: "#8C6E54",
  },
  {
    id: "p2-4",
    order: 4,
    title: "Yangi shirinlik demo",
    brief: "Yaqin plan: qatlamlar kesimi, sekin harakat, ovoz ASMR.",
    platform: "instagram",
    date: "2026-09-11",
    time: "18:00",
    state: "processing",
  },
  {
    id: "p2-5",
    order: 5,
    title: "Ustaxona: don qovurish",
    brief: "Timelapse qovurish jarayoni + barista izohi 20s.",
    platform: "youtube",
    date: "2026-09-12",
    time: "13:00",
    state: "processing",
  },
  {
    id: "p2-6",
    order: 6,
    title: "Trend audio · 3 kadr",
    brief: "Hozirgi trend audio ustiga 3 kadr montaj, matn overlay.",
    platform: "instagram",
    date: "2026-09-13",
    time: "20:00",
    state: "processing",
  },
  {
    id: "p2-7",
    order: 7,
    title: "Hafta yakuni · CTA",
    brief: "Eng yaxshi kadrlar montaji + dushanba aksiyasi e'loni.",
    platform: "instagram",
    date: "2026-09-14",
    time: "17:00",
    state: "processing",
  },
]

const upcomingVideos: PlanVideo[] = [
  {
    id: "p3-1",
    order: 1,
    title: "Hafta hook · kuz menyusi",
    brief: "Kuz menyusi e'loni: 3 kadr, issiq ranglar, matn overlay.",
    platform: "instagram",
    date: "2026-09-15",
    time: "18:00",
    state: "draft",
  },
  {
    id: "p3-2",
    order: 2,
    title: "Trend audio · latte pour",
    brief: "Hozir trendda #2 audio ustiga latte quyish kadri, 9s.",
    platform: "tiktok",
    date: "2026-09-16",
    time: "12:30",
    state: "draft",
  },
  {
    id: "p3-3",
    order: 3,
    title: "UGC: mijoz kuni",
    brief: "Mijoz do'kondagi kunini o'zi suratga oladi, 20s montaj.",
    platform: "instagram",
    date: "2026-09-17",
    time: "19:00",
    state: "draft",
  },
  {
    id: "p3-4",
    order: 4,
    title: "Barista sirlari · 3 maslahat",
    brief: "Ekranda 3 ta qisqa maslahat, tez kesimlar.",
    platform: "youtube",
    date: "2026-09-18",
    time: "13:00",
    state: "draft",
  },
  {
    id: "p3-5",
    order: 5,
    title: "Yangi shirinlik teaser",
    brief: "Sekin harakat + ASMR ovoz, oxirida narx overlay.",
    platform: "instagram",
    date: "2026-09-19",
    time: "18:30",
    state: "draft",
  },
  {
    id: "p3-6",
    order: 6,
    title: "Dam olish kuni aksiyasi",
    brief: "Shanba aksiyasi e'loni, CTA: profil havolasi.",
    platform: "instagram",
    date: "2026-09-20",
    time: "11:00",
    state: "draft",
  },
  {
    id: "p3-7",
    order: 7,
    title: "Hafta yakuni · natijalar",
    brief: "Haftaning eng yaxshi kadrlari + minnatdorchilik.",
    platform: "instagram",
    date: "2026-09-21",
    time: "20:00",
    state: "draft",
  },
]

export const WEEK_PLANS: WeekPlan[] = [
  {
    id: "week-3",
    start: "2026-09-15",
    end: "2026-09-21",
    week: 3,
    range: "dashboard.video.demo.weeks.upcoming.range",
    status: "upcoming",
    progress: "0/7",
    produced: 0,
    total: 7,
    videos: upcomingVideos,
    note: "dashboard.video.demo.weeks.upcoming.note",
  },
  {
    id: "week-2",
    start: "2026-09-08",
    end: "2026-09-14",
    week: 2,
    range: "dashboard.video.demo.weeks.ongoing.range",
    status: "ongoing",
    progress: "3/7",
    produced: 3,
    total: 7,
    videos: ongoingVideos,
    note: "dashboard.video.demo.weeks.ongoing.note",
  },
  {
    id: "week-1",
    start: "2026-09-01",
    end: "2026-09-07",
    week: 1,
    range: "dashboard.video.demo.weeks.done.range",
    status: "done",
    progress: "6/6",
    produced: 6,
    total: 6,
    views: "1.9M",
    videos: doneVideos,
    note: "dashboard.video.demo.weeks.done.note",
  },
]

/** Compact history rows shown in the plans left rail. */
export const PLAN_HISTORY: PlanHistoryEntry[] = [
  { id: "h-aug-4", start: "2026-08-25", end: "2026-08-31", week: 4, status: "done", progress: "7/7" },
  { id: "h-aug-3", start: "2026-08-18", end: "2026-08-24", week: 3, status: "done", progress: "6/6" },
  { id: "h-aug-2", start: "2026-08-11", end: "2026-08-17", week: 2, status: "done", progress: "7/7" },
  { id: "h-aug-1", start: "2026-08-04", end: "2026-08-10", week: 1, status: "done", progress: "6/6" },
  { id: "h-jul-4", start: "2026-07-28", end: "2026-08-03", week: 4, status: "done", progress: "7/7" },
]

/** September 2026 grid. 1 Sep 2026 is a Tuesday (index 1 in Mon-first week). */
export const CALENDAR_DAYS: CalendarDay[] = (() => {
  const days: CalendarDay[] = []
  // Leading blanks: Monday-first, September starts on Tuesday → 1 blank.
  days.push({ day: 0, muted: true })
  const published = new Set([1, 2, 3, 5, 6, 7, 8, 9, 10])
  const scheduled = new Set([11, 12])
  const plan = new Set([15, 16, 17, 18, 19, 20, 21])
  for (let day = 1; day <= 30; day += 1) {
    const cell: CalendarDay = { day }
    if (published.has(day)) cell.marker = "published"
    else if (scheduled.has(day)) cell.marker = "scheduled"
    else if (plan.has(day)) cell.marker = "plan"
    if (day >= 8 && day <= 14) cell.inRange = true
    if (day === 10) cell.today = true
    days.push(cell)
  }
  return days
})()

export const SCRIPT_CONVERSATION: ScriptMessage[] = [
  {
    id: "sc-1",
    role: "assistant",
    text: "Salom! Bu video uchun joriy script: mijoz do'kondagi kunini o'zi suratga oladi, 20s montaj. Nimani o'zgartiramiz?",
  },
  {
    id: "sc-2",
    role: "user",
    text: "Trend o'zgardi — POV formatdagi videolar ko'proq ko'rish olyapti. Shu formatga o'tkaz va 15 soniyaga qisqartir.",
  },
  {
    id: "sc-3",
    role: "assistant",
    text: "Tayyor. Yangi variant: POV — “mijoz ko'zi bilan” 15s, 4 kadr, trend audio #2, oxirida 2s CTA overlay. Ohang: samimiy, tez kesim.",
    chips: ["POV format", "20s → 15s", "trend audio"],
  },
]

export const SCRIPT_CURRENT =
  "Mijoz do'kondagi kunini o'zi suratga oladi. 20s montaj, subtitrlar UZ, oxirida profil havolasi."

export const SCRIPT_PROPOSED =
  "POV: “mijoz ko'zi bilan” — 15s, 4 kadr (kirish, buyurtma, birinchi qultum, tabassum). Trend audio #2, oxirgi 2s CTA overlay."
