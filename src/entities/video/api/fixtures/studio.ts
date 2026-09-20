import type { PublishTarget, StudioVideo } from "../../model/types"

// Stand-in library + publish defaults for the studio (New video) screen.

export const STUDIO_VIDEOS: StudioVideo[] = [
  {
    id: "sv-1",
    title: "Kuzgi menyu e'loni",
    meta: "Bugun 14:20 · 15s",
    status: "draft",
    thumbnail: "#D6D2CC",
  },
  {
    id: "sv-2",
    title: "Barista tanlovi teaser",
    meta: "Kecha 19:05 · 12s",
    status: "published",
    thumbnail: "#C9A98C",
    hasLink: true,
  },
  {
    id: "sv-3",
    title: "Yangi shirinlik POV",
    meta: "9 sen · 18s",
    status: "published",
    thumbnail: "#8C6E54",
    hasLink: true,
  },
  {
    id: "sv-4",
    title: "Do'kon tur · 360°",
    meta: "7 sen · 20s",
    status: "published",
    thumbnail: "#2B3A67",
    hasLink: true,
  },
  {
    id: "sv-5",
    title: "Aksiya e'loni · shanba",
    meta: "5 sen · 10s",
    status: "draft",
    thumbnail: "#E8E6E2",
  },
  {
    id: "sv-6",
    title: "Mijoz sharhi montaji",
    meta: "3 sen · 16s",
    status: "published",
    thumbnail: "#B4472E",
    hasLink: true,
  },
]

export const PUBLISH_TARGETS: PublishTarget[] = [
  { platform: "instagram", handle: "@aura.store", enabled: true },
  { platform: "tiktok", handle: "@aurastore.uz", enabled: true },
  { platform: "youtube", handle: "Aura Store", enabled: false },
]

export const STUDIO_CAPTION =
  "Kuz keldi ☕ Yangi mavsumiy menyu bugundan Aura Store'da. Sizni kutamiz!"

export const STUDIO_HASHTAGS = [
  "#aurastore",
  "#kuzmenyu",
  "#toshkentkofe",
  "#coffeetime",
]
