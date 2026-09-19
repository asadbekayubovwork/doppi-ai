export interface NavLink {
  label: string
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
  label: "Home",
  to: "/app",
  icon: "layout-grid",
  exact: true,
}

// Two groups, matching the product split: what the workspace runs, and how the
// workspace itself is administered.
export const SERVICES: NavItem[] = [
  {
    label: "Universal RAG Agent",
    to: "/app/rag",
    icon: "library",
    children: [
      { label: "Create agent", to: "/app/rag/create", icon: "circle-plus" },
    ],
  },
  { label: "Voice Agent", to: "/app/voice", icon: "audio-lines", badge: 3 },
  {
    label: "Video Generator",
    to: "/app/video",
    icon: "clapperboard",
    children: [
      {
        label: "Plans",
        to: "/app/video#plans",
        icon: "calendar-days",
        badge: 3,
      },
      { label: "New video", to: "/app/video#new-video", icon: "sparkles" },
    ],
  },
]

export const WORKSPACE: NavItem[] = [
  { label: "Usage & Billing", to: "/app/usage", icon: "bar-chart-3" },
  { label: "Team", to: "/app/team", icon: "users" },
  { label: "Settings", to: "/app/settings", icon: "settings" },
]
