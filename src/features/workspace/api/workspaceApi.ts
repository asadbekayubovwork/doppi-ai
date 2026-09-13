import { apiClient } from "@/shared/api"
import type { User } from "@/features/auth"

export interface SessionItem {
  id: string
  device_name: string
  user_agent: string | null
  ip_address: string | null
  last_seen_at: string
  absolute_expires_at: string
  revoked_at: string | null
}

export interface Membership {
  user_id: string
  business_id: string
  role: "owner" | "admin" | "member" | "viewer"
  status: string
  joined_at: string
}

export interface Invitation {
  id: string
  status: string
  token: string
  expires_at: string
}

export interface ApiKeyItem {
  id: string
  name: string
  key_prefix: string
  scopes: string[]
  expires_at: string | null
  revoked_at: string | null
  secret?: string | null
}

export interface ProfilePayload {
  first_name?: string
  last_name?: string
  locale?: string
  timezone?: string
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api/v1"

export const workspaceApi = {
  googleLinkUrl: () => `${API_BASE_URL}/auth/oauth/google/link/authorize`,
  updateProfile: (payload: ProfilePayload) =>
    apiClient.patch<User>("/me", payload),

  changePassword: (payload: {
    current_password: string
    new_password: string
  }) => apiClient.post<{ status: string }>("/auth/password", payload),

  listSessions: () => apiClient.get<SessionItem[]>("/auth/sessions"),
  revokeSession: (sessionId: string) =>
    apiClient.delete<{ status: string }>(`/auth/sessions/${sessionId}`),
  logoutAll: () => apiClient.post<{ status: string }>("/auth/logout-all"),

  listMembers: (businessId: string) =>
    apiClient.get<Membership[]>(`/businesses/${businessId}/members`),
  inviteMember: (
    businessId: string,
    payload: { email: string; role: "admin" | "member" | "viewer" }
  ) =>
    apiClient.post<Invitation>(
      `/businesses/${businessId}/invitations`,
      payload
    ),
  updateMember: (
    businessId: string,
    userId: string,
    role: Membership["role"]
  ) =>
    apiClient.patch<Membership>(`/businesses/${businessId}/members/${userId}`, {
      role,
    }),
  removeMember: (businessId: string, userId: string) =>
    apiClient.delete<{ status: string }>(
      `/businesses/${businessId}/members/${userId}`
    ),
  acceptInvitation: (token: string) =>
    apiClient.post<Membership>(
      `/invitations/${encodeURIComponent(token)}/accept`
    ),

  listApiKeys: (businessId: string) =>
    apiClient.get<ApiKeyItem[]>(`/businesses/${businessId}/api-keys`),
  createApiKey: (
    businessId: string,
    payload: { name: string; scopes: string[]; expires_at?: string | null }
  ) =>
    apiClient.post<ApiKeyItem>(`/businesses/${businessId}/api-keys`, payload),
  rotateApiKey: (businessId: string, keyId: string) =>
    apiClient.post<ApiKeyItem>(
      `/businesses/${businessId}/api-keys/${keyId}/rotate`
    ),
  revokeApiKey: (businessId: string, keyId: string) =>
    apiClient.delete<{ status: string }>(
      `/businesses/${businessId}/api-keys/${keyId}`
    ),
}
