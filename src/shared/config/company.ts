/**
 * The legal entity that operates Do'ppi AI, as written on its registration
 * certificate — the single source for the footer, the about, contact, pricing
 * and legal pages, and the Organization structured data. Reviewers (Google for
 * Startups, billing) compare these letter for letter against the certificate,
 * LinkedIn and the application, so change them here and nowhere else.
 *
 * The localized parts — the legal form ("LLC" / "MChJ") and the address
 * written out — live under `company.*` in the locale files. Kept free of Vue
 * and `@/` imports so the build (build/seo.ts) can read it as well.
 */

const NAME = "ADS AI AUTOMATION"

export const COMPANY = {
  /** Registered name without its legal form; `company.legalName` adds it. */
  name: NAME,
  /** English legal name, used as-is in structured data. */
  legalName: `${NAME} LLC`,
  /** STIR from the certificate. Left empty, it is shown nowhere. */
  taxId: "",
  /** Registration date as YYYY-MM-DD; the year alone until the date is filled in. */
  incorporated: "2026",
  /** The product went live before the company was registered. */
  productLaunched: 2025,
  /** Registered address in English, for structured data. */
  address: {
    streetAddress: "Apt. 42, Bldg. 20, Qora-Qamish 1/1, Oltinsoy MFY",
    addressLocality: "Tashkent",
    addressRegion: "Olmazor District",
    /** Left empty, it is left out of the structured data. */
    postalCode: "",
    addressCountry: "UZ",
  },
}

export const incorporatedYear = (): string => COMPANY.incorporated.slice(0, 4)
