import type {
  CalendarDay,
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
    date: "1 sen",
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
    date: "2 sen",
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
    date: "3 sen",
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
    date: "5 sen",
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
    date: "6 sen",
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
    date: "7 sen",
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
    date: "8 sen",
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
    date: "9 sen",
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
    date: "10 sen",
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
    date: "11 sen",
    time: "18:00",
    state: "processing",
  },
  {
    id: "p2-5",
    order: 5,
    title: "Ustaxona: don qovurish",
    brief: "Timelapse qovurish jarayoni + barista izohi 20s.",
    platform: "youtube",
    date: "12 sen",
    time: "13:00",
    state: "processing",
  },
  {
    id: "p2-6",
    order: 6,
    title: "Trend audio · 3 kadr",
    brief: "Hozirgi trend audio ustiga 3 kadr montaj, matn overlay.",
    platform: "instagram",
    date: "13 sen",
    time: "20:00",
    state: "processing",
  },
  {
    id: "p2-7",
    order: 7,
    title: "Hafta yakuni · CTA",
    brief: "Eng yaxshi kadrlar montaji + dushanba aksiyasi e'loni.",
    platform: "instagram",
    date: "14 sen",
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
    date: "15 sen",
    time: "18:00",
    state: "draft",
  },
  {
    id: "p3-2",
    order: 2,
    title: "Trend audio · latte pour",
    brief: "Hozir trendda #2 audio ustiga latte quyish kadri, 9s.",
    platform: "tiktok",
    date: "16 sen",
    time: "12:30",
    state: "draft",
  },
  {
    id: "p3-3",
    order: 3,
    title: "UGC: mijoz kuni",
    brief: "Mijoz do'kondagi kunini o'zi suratga oladi, 20s montaj.",
    platform: "instagram",
    date: "17 sen",
    time: "19:00",
    state: "draft",
  },
  {
    id: "p3-4",
    order: 4,
    title: "Barista sirlari · 3 maslahat",
    brief: "Ekranda 3 ta qisqa maslahat, tez kesimlar.",
    platform: "youtube",
    date: "18 sen",
    time: "13:00",
    state: "draft",
  },
  {
    id: "p3-5",
    order: 5,
    title: "Yangi shirinlik teaser",
    brief: "Sekin harakat + ASMR ovoz, oxirida narx overlay.",
    platform: "instagram",
    date: "19 sen",
    time: "18:30",
    state: "draft",
  },
  {
    id: "p3-6",
    order: 6,
    title: "Dam olish kuni aksiyasi",
    brief: "Shanba aksiyasi e'loni, CTA: profil havolasi.",
    platform: "instagram",
    date: "20 sen",
    time: "11:00",
    state: "draft",
  },
  {
    id: "p3-7",
    order: 7,
    title: "Hafta yakuni · natijalar",
    brief: "Haftaning eng yaxshi kadrlari + minnatdorchilik.",
    platform: "instagram",
    date: "21 sen",
    time: "20:00",
    state: "draft",
  },
]

export const WEEK_PLANS: WeekPlan[] = [
  {
    id: "week-3",
    title: "Sentabr · hafta 3",
    range: "15–21 sentabr · 7 video · research asosida",
    status: "upcoming",
    progress: "0/7",
    produced: 0,
    total: 7,
    videos: upcomingVideos,
    note: "Dushanbagacha tahrir qilinmasa, plan avtomatik Ongoing bo'ladi",
  },
  {
    id: "week-2",
    title: "Sentabr · hafta 2",
    range: "8–14 sentabr · 7 video · 3 chiqarildi · bugun 10 sentabr",
    status: "ongoing",
    progress: "3/7",
    produced: 3,
    total: 7,
    videos: ongoingVideos,
    note: "Faqat vaqti kelmagan videolar tahrirlanadi · hafta yakunida plan Done bo'ladi",
  },
  {
    id: "week-1",
    title: "Sentabr · hafta 1",
    range: "1–7 sentabr · 6 video · 1.9M ko'rish · o'rtacha ER 8.4%",
    status: "done",
    progress: "6/6",
    produced: 6,
    total: 6,
    views: "1.9M",
    videos: doneVideos,
    note: "Hafta yakunlandi · natijalar umumiy dashboard statistikasiga qo'shildi",
  },
]

/** Compact history rows shown in the plans left rail. */
export const PLAN_HISTORY: Array<{
  id: string
  title: string
  range: string
  status: WeekPlan["status"]
  progress: string
  views?: string
}> = [
  {
    id: "h-1",
    title: "Avgust · hafta 4",
    range: "25–31 avgust",
    status: "done",
    progress: "7/7",
    views: "1.4M",
  },
  {
    id: "h-2",
    title: "Avgust · hafta 3",
    range: "18–24 avgust",
    status: "done",
    progress: "6/6",
    views: "1.1M",
  },
  {
    id: "h-3",
    title: "Avgust · hafta 2",
    range: "11–17 avgust",
    status: "done",
    progress: "7/7",
    views: "980K",
  },
  {
    id: "h-4",
    title: "Avgust · hafta 1",
    range: "4–10 avgust",
    status: "done",
    progress: "6/6",
    views: "760K",
  },
  {
    id: "h-5",
    title: "Iyul · hafta 4",
    range: "28 iyul–3 avgust",
    status: "done",
    progress: "7/7",
    views: "640K",
  },
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

export const CALENDAR_WEEKDAYS = ["Du", "Se", "Ch", "Pa", "Ju", "Sh", "Ya"]

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
