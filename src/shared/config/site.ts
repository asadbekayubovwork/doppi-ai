/**
 * Public identity of the site — the single source for canonical URLs, the
 * sitemap and structured data. Kept free of Vue and `@/` imports so the build
 * (vite.config.ts) can read it as well.
 */
export const SITE_URL = "https://doppiai.uz"
export const SITE_NAME = "Do'ppi AI"

/**
 * Spellings people actually type into a search box. Google reads these from
 * the WebSite and Organization structured data when it decides which queries
 * are searches for the brand.
 */
export const SITE_ALTERNATE_NAMES = ["Doppi AI", "Do'ppi.ai", "DoppiAI", "Doppi.ai"]

/** Square PNG at a stable URL, as Google requires for an organization logo. */
export const SITE_LOGO_PATH = "/apple-touch-icon.png"

/**
 * Link-preview images for Telegram, Facebook, WhatsApp and X, rendered from
 * build/og/template.html by `pnpm og:images`.
 */
export const OG_IMAGE = { default: "/og/home.png", width: 1200, height: 630, type: "image/png" }

export const absoluteUrl = (path: string): string => new URL(path, SITE_URL).href
