export type AdminTab = "overview" | "services" | "users" | "pricing" | "rag"

export const ADMIN_NAV: Array<{
  label: string
  items: Array<{
    key: AdminTab
    title: string
    description: string
    icon: string
  }>
}> = [
  {
    label: "Monitoring",
    items: [
      {
        key: "overview",
        title: "Umumiy",
        description: "Platforma ko‘rsatkichlari",
        icon: "layout-grid",
      },
      {
        key: "services",
        title: "Xizmatlar",
        description: "Sarflar va video holati",
        icon: "chart-line",
      },
      {
        key: "users",
        title: "Foydalanuvchilar",
        description: "Akkauntlar va faollik",
        icon: "user-round",
      },
    ],
  },
  {
    label: "Boshqaruv",
    items: [
      {
        key: "pricing",
        title: "Kredit va tariflar",
        description: "Narx siyosati",
        icon: "credit-card",
      },
      {
        key: "rag",
        title: "RAG sozlamalari",
        description: "Modellar va limitlar",
        icon: "settings-2",
      },
    ],
  },
]

export const adminTabFromQuery = (value: unknown): AdminTab =>
  ADMIN_NAV.flatMap((section) => section.items).find(
    (item) => item.key === value
  )?.key ?? "overview"

export const adminTabDetails = (tab: AdminTab) =>
  ADMIN_NAV.flatMap((section) => section.items).find(
    (item) => item.key === tab
  )!
