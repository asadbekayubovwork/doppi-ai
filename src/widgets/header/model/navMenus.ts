import { SERVICE_NAV } from "@/shared/config/services"

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

/**
 * The header's services menu, two columns side by side: live services in
 * SERVICE_NAV order, then the offerings that are on the way.
 */
export const SERVICES_MENU: NavMenuColumn[] = [
  {
    items: SERVICE_NAV.map((service) => ({
      label: `services.${service.key}.name`,
      to: service.to,
    })),
  },
  {
    items: ["marketRadar", "personalBlogs", "farmers", "ytBusiness"].map((key) => ({
      label: `services.menu.items.${key}`,
    })),
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
