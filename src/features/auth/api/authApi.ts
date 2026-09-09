import { apiClient } from "@/shared/api"

export interface SignInPayload {
  email: string
  password: string
}

export interface AuthResponse {
  token?: string
  accessToken?: string
}

/**
 * Authentication endpoints are kept in one place so the landing can point to
 * the production API without coupling page components to a transport layer.
 */
export const authApi = {
  signIn: (payload: SignInPayload) =>
    apiClient.post<AuthResponse>("/auth/login", payload),
  requestPasswordReset: (email: string) =>
    apiClient.post<void>("/auth/forgot-password", { email }),
}

