import { SERVICE_NAV } from "@/shared/config/services"
import { SERVICE_PATHS } from "@/shared/config/seoPages"

export interface NavMenuItem {
  /** Full i18n key of the label. */
  label: string
  /** Offerings that are not live yet have no page: they render as plain text
   *  with a "coming soon" tag. Adding `to` is all it takes to launch one. */
  to?: string
}

export interface NavMenuColumn {
  /** Full i18n key of the column heading; single-column menus go without. */
  title?: string
  items: NavMenuItem[]
}

const soon = (key: string): NavMenuItem => ({
  label: `services.menu.items.${key}`,
})

/**
 * The header's services menu, columns side by side: live services in
 * SERVICE_NAV order followed by Market Radar, then voice agent use cases and
 * industries. Use cases all land on the voice agent page until each gets a
 * page of its own.
 */
export const SERVICES_MENU: NavMenuColumn[] = [
  {
    items: [
      ...SERVICE_NAV.map((service) => ({
        label: `services.${service.key}.name`,
        to: service.to,
      })),
      soon("marketRadar"),
    ],
  },
  {
    title: "services.menu.useCases",
    items: ["support", "sales", "booking", "surveys"].map((key) => ({
      label: `services.menu.items.${key}`,
      to: SERVICE_PATHS.voice,
    })),
  },
  {
    title: "services.menu.industries",
    items: [
      "healthcare",
      "realEstate",
      "travel",
      "automotive",
      "banking",
      "ecommerce",
      "personalBlogs",
      "farmers",
      "ytBusiness",
    ].map(soon),
  },
]

/** Blog and the languages page are not built yet; contact lives here too. */
export const RESOURCES_MENU: NavMenuColumn[] = [
  {
    items: [
      { label: "nav.blog" },
      { label: "nav.languages" },
      { label: "nav.contact", to: "/contact-us" },
    ],
  },
]
