import { apiClient } from "@/shared/api"

export interface SignInPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token?: string
  accessToken?: string
}

export interface RegisterPayload extends SignInPayload {
  name: string
  // Every account starts with one business; more are added from the dashboard.
  businessName: string
}

export interface ResetPasswordPayload {
  email: string
  code: string
  password: string
}

export interface ResetPasswordResponse {
  /** Sessions the backend invalidated because the password changed. */
  signedOutSessions?: number
  devices?: string[]
}

/**
 * Authentication endpoints are kept in one place so the landing can point to
 * the production API without coupling page components to a transport layer.
 */
export const authApi = {
  signIn: (payload: SignInPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload),
  register: (payload: RegisterPayload) =>
    apiClient.post<AuthResponse>("/auth/register", payload),
  requestPasswordReset: (email: string) =>
    apiClient.post<void>("/auth/forgot-password", { email }),
  resetPassword: (payload: ResetPasswordPayload) =>
    apiClient.post<ResetPasswordResponse>("/auth/reset-password", payload),
}
