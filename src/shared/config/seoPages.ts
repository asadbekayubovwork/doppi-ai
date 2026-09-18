/**
 * Every page search engines should index. The build turns this list into a
 * static HTML head per page and into sitemap.xml, and App.vue marks every other
 * route noindex — so adding a page here is all it takes to publish it to
 * search. Kept free of Vue and `@/` imports so vite.config.ts can read it.
 */
import { OG_IMAGE } from "./site"

export const SERVICE_PATHS = {
  rag: "/rag-agent",
  voice: "/voice-agent",
  video: "/video-generator",
} as const

export type ServiceKey = keyof typeof SERVICE_PATHS

export const SERVICE_KEYS = Object.keys(SERVICE_PATHS) as ServiceKey[]

export interface SeoPage {
  /** Route path exactly as users, canonical links and the sitemap see it. */
  path: string
  /** Branch under `seo.*` in the locale files holding title and description. */
  seoKey: string
  /** Service pages also publish Service, breadcrumb and FAQ structured data. */
  service?: ServiceKey
  /** Link-preview image; pages without their own share OG_IMAGE.default. */
  ogImage?: string
  priority: number
}

export const SEO_PAGES: readonly SeoPage[] = [
  { path: "/", seoKey: "home", priority: 1.0 },
  {
    path: SERVICE_PATHS.rag,
    seoKey: "ragAgent",
    service: "rag",
    ogImage: "/og/rag.png",
    priority: 0.9,
  },
  {
    path: SERVICE_PATHS.voice,
    seoKey: "voiceAgent",
    service: "voice",
    ogImage: "/og/voice.png",
    priority: 0.9,
  },
  {
    path: SERVICE_PATHS.video,
    seoKey: "videoGenerator",
    service: "video",
    ogImage: "/og/video.png",
    priority: 0.9,
  },
  { path: "/product", seoKey: "product", priority: 0.8 },
  { path: "/pricing", seoKey: "pricing", priority: 0.8 },
  { path: "/about", seoKey: "about", priority: 0.6 },
  { path: "/contact-us", seoKey: "contact", priority: 0.6 },
]

export const ogImageFor = (page: SeoPage): string => page.ogImage ?? OG_IMAGE.default

/** `/pricing/` and `/pricing` are the same page; only the root keeps its slash. */
export const normalizePath = (path: string): string =>
  path.length > 1 ? path.replace(/\/+$/, "") : path

export const findSeoPage = (path: string): SeoPage | undefined => {
  const normalized = normalizePath(path)
  return SEO_PAGES.find((page) => page.path === normalized)
}
