import type { Business as ApiBusiness } from "@/features/auth"

export interface Business extends ApiBusiness {
  initials: string
  plan: string
  members?: number
}
