export interface NavLink {
  /** i18n key under `dashboard.nav`, resolved where the link is rendered. */
  labelKey: string
  to: string
  icon: string
  badge?: number
}

export interface NavItem extends NavLink {
  /** Sub-pages shown in a collapsible group under the item. */
  children?: NavLink[]
  /** Active on its own path only, not on every page below it. */
  exact?: boolean
}

// Every /app page sits below the home path, so it only matches exactly.
export const HOME: NavItem = {
  labelKey: "dashboard.nav.home",
  to: "/app",
  icon: "layout-grid",
  exact: true,
}

// Two groups, matching the product split: what the workspace runs, and how the
// workspace itself is administered.
export const SERVICES: NavItem[] = [
  {
    labelKey: "dashboard.nav.rag",
    to: "/app/rag",
    icon: "library",
    children: [
      {
        labelKey: "dashboard.nav.ragCreate",
        to: "/app/rag/create",
        icon: "circle-plus",
      },
    ],
  },
  {
    labelKey: "dashboard.nav.voice",
    to: "/app/voice",
    icon: "audio-lines",
    badge: 3,
  },
  {
    labelKey: "dashboard.nav.video",
    to: "/app/video",
    icon: "clapperboard",
    children: [
      {
        labelKey: "dashboard.nav.videoPlans",
        to: "/app/video/plans",
        icon: "calendar-days",
        badge: 3,
      },
      {
        labelKey: "dashboard.nav.videoNew",
        to: "/app/video/new",
        icon: "sparkles",
      },
    ],
  },
]

export const WORKSPACE: NavItem[] = [
  { labelKey: "dashboard.nav.usage", to: "/app/usage", icon: "bar-chart-3" },
  { labelKey: "dashboard.nav.settings", to: "/app/settings", icon: "settings" },
]
