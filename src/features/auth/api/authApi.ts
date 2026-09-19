import { apiClient } from "@/shared/api"
import { oauthAuthorizeUrl } from "@/shared/config/api"

export interface User {
  id: string
  email: string
  email_verified_at: string | null
  status: string
  first_name: string
  last_name: string
  locale: string
  timezone: string
}

export interface SessionResponse {
  user: User
  session_id: string
  expires_at: string
  csrf_token?: string | null
}

export interface MfaRequiredResponse {
  status: "mfa_required"
  challenge_id: string
}

export type LoginResponse = SessionResponse | MfaRequiredResponse
export type AuthResponse = LoginResponse

export interface SignInPayload {
  email: string
  password: string
  remember_me?: boolean
}

export interface SignupPayload {
  email: string
  password: string
  first_name?: string
  last_name?: string
  business_name: string
}

export type RegisterPayload = SignupPayload

export interface SignupResponse {
  status: "verification_required"
  user_id: string
  business_id: string
  challenge_id: string
}

export interface OtpVerificationPayload {
  challenge_id: string
  code: string
}

export interface MfaVerificationPayload extends OtpVerificationPayload {
  remember_me?: boolean
}

export interface OtpResponse {
  status: string
  challenge_id?: string | null
}

export interface ResetVerifyResponse {
  status: "verified"
  reset_token: string
}

export interface PasswordResetConfirmPayload {
  reset_token: string
  new_password: string
}

export interface ResetPasswordPayload {
  reset_token: string
  new_password: string
}

export interface MessageResponse {
  status: string
}

export interface Business {
  id: string
  name: string
  slug: string
  status: string
  default_language: string
  billing_region: string
  role?: string | null
}

export interface BusinessCreatePayload {
  name: string
  default_language?: string
  billing_region?: string
}

export interface TelegramLoginResponse {
  status: "challenge_required"
  challenge_id: string
}

export type TelegramAuthResponse = SessionResponse | TelegramLoginResponse

const GOOGLE_AUTHORIZE_PATH = "/auth/oauth/google/authorize"

const asEmailPayload = (email: string | { email: string }) =>
  typeof email === "string" ? { email } : email

const normalizeTelegramData = (data: Record<string, string | number>) =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, String(value)])
  )

export const authApi = {
  signIn: (payload: SignInPayload) =>
    apiClient.post<LoginResponse>("/auth/login", payload),

  signup: (payload: SignupPayload) =>
    apiClient.post<SignupResponse>("/auth/signup", payload),

  register: (payload: SignupPayload) => authApi.signup(payload),

  verifyEmail: (payload: OtpVerificationPayload) =>
    apiClient.post<MessageResponse>(
      "/auth/email-verifications/verify",
      payload
    ),

  requestEmailVerification: (payload: { email: string }) =>
    apiClient.post<OtpResponse>("/auth/email-verifications", payload),

  verifyMfa: (payload: MfaVerificationPayload) =>
    apiClient.post<SessionResponse>("/auth/mfa/login/verify", payload),

  requestPasswordReset: (email: string | { email: string }) =>
    apiClient.post<OtpResponse>("/auth/password-resets", asEmailPayload(email)),

  verifyPasswordReset: (payload: OtpVerificationPayload) =>
    apiClient.post<ResetVerifyResponse>(
      "/auth/password-resets/verify",
      payload
    ),

  confirmPasswordReset: (payload: PasswordResetConfirmPayload) =>
    apiClient.post<MessageResponse>("/auth/password-resets/confirm", payload),

  resetPassword: (payload: ResetPasswordPayload) =>
    authApi.confirmPasswordReset(payload),

  getSession: () => apiClient.get<SessionResponse>("/auth/session"),

  getMe: () => apiClient.get<User>("/me"),

  patchMe: (
    payload: Partial<
      Pick<User, "first_name" | "last_name" | "locale" | "timezone">
    >
  ) => apiClient.patch<User>("/me", payload),

  logout: () => apiClient.post<MessageResponse>("/auth/logout"),

  logoutAll: () => apiClient.post<MessageResponse>("/auth/logout-all"),

  googleAuthorizeUrl: () =>
    oauthAuthorizeUrl(
      GOOGLE_AUTHORIZE_PATH,
      import.meta.env.VITE_GOOGLE_OAUTH_URL
    ),

  telegramLogin: (data: Record<string, string | number>) =>
    apiClient.post<TelegramAuthResponse>("/auth/telegram/login", {
      data: normalizeTelegramData(data),
    }),

  listBusinesses: () => apiClient.get<Business[]>("/businesses"),

  createBusiness: (payload: BusinessCreatePayload, idempotencyKey?: string) =>
    apiClient.post<Business>("/businesses", payload, {
      headers: idempotencyKey
        ? { "Idempotency-Key": idempotencyKey }
        : undefined,
    }),

  selectBusiness: (businessId: string) =>
    apiClient.post<Business>(`/businesses/${businessId}/context`),
}
