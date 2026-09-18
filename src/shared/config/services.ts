import { SERVICE_KEYS, SERVICE_PATHS, type ServiceKey } from "./seoPages"

export const SERVICE_ICONS: Record<ServiceKey, string> = {
  rag: "bot",
  voice: "phone",
  video: "clapperboard",
}

export interface ServiceNavItem {
  key: ServiceKey
  to: string
  icon: string
}

/** Header menu, footer column and cross-links all list services in this order. */
export const SERVICE_NAV: ServiceNavItem[] = SERVICE_KEYS.map((key) => ({
  key,
  to: SERVICE_PATHS[key],
  icon: SERVICE_ICONS[key],
}))
