import { defineStore } from "pinia"
import { clearRagTokens } from "@/entities/rag-agent"
import { clearRagAdminToken } from "@/features/rag-admin"
import {
  authApi,
  type Business,
  type BusinessCreatePayload,
  type LoginResponse,
  type SessionResponse,
  type SignInPayload,
  type SignupPayload,
  type TelegramAuthResponse,
  type User,
} from "../api/authApi"
import { safeLocalPath } from "./redirect"

export type AuthStatus = "unknown" | "loading" | "authenticated" | "anonymous"

let bootstrapRequest: Promise<boolean> | null = null
let bootstrapGeneration = 0

const isMfaResponse = (
  response: LoginResponse
): response is Extract<LoginResponse, { status: "mfa_required" }> =>
  "status" in response && response.status === "mfa_required"

const generatedIdempotencyKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    status: "unknown" as AuthStatus,
    user: null as User | null,
    session: null as SessionResponse | null,
    businesses: [] as Business[],
    activeBusinessId: null as string | null,
    mfaChallengeId: null as string | null,
    mfaRememberMe: false,
    bootstrapError: null as unknown,
    businessError: null as unknown,
  }),

  getters: {
    isAuthenticated: (state) => state.status === "authenticated",
    activeBusiness: (state) =>
      state.businesses.find(
        (business) => business.id === state.activeBusinessId
      ) ??
      state.businesses[0] ??
      null,
    safeRedirect: () => (value: unknown) => safeLocalPath(value),
  },

  actions: {
    setSession(response: SessionResponse) {
      this.session = response
      this.user = response.user
      this.status = "authenticated"
      this.mfaChallengeId = null
      this.mfaRememberMe = false
      this.bootstrapError = null
    },

    clearSession() {
      clearRagTokens()
      clearRagAdminToken()
      this.session = null
      this.user = null
      this.businesses = []
      this.activeBusinessId = null
      this.mfaChallengeId = null
      this.mfaRememberMe = false
      this.businessError = null
      this.status = "anonymous"
    },

    async loadBusinesses() {
      try {
        this.businesses = await authApi.listBusinesses()
        if (
          this.activeBusinessId === null ||
          !this.businesses.some(
            (business) => business.id === this.activeBusinessId
          )
        ) {
          this.activeBusinessId = this.businesses[0]?.id ?? null
        }
        this.businessError = null
        return true
      } catch (error) {
        this.businessError = error
        return false
      }
    },

    async bootstrap(force = false) {
      if (!force && this.status === "authenticated") return true
      if (!force && bootstrapRequest) return bootstrapRequest

      const generation = ++bootstrapGeneration
      this.status = "loading"
      this.bootstrapError = null
      const request = (async () => {
        try {
          const response = await authApi.getSession()
          if (generation !== bootstrapGeneration) return this.isAuthenticated
          this.setSession(response)
          await this.loadBusinesses()
          return true
        } catch (error) {
          if (generation !== bootstrapGeneration) return this.isAuthenticated
          this.clearSession()
          this.bootstrapError = error
          return false
        } finally {
          if (generation === bootstrapGeneration) bootstrapRequest = null
        }
      })()
      bootstrapRequest = request
      return request
    },

    async login(payload: SignInPayload): Promise<LoginResponse> {
      this.status = "loading"
      let response: LoginResponse
      try {
        response = await authApi.signIn(payload)
      } catch (error) {
        this.clearSession()
        throw error
      }
      if (isMfaResponse(response)) {
        this.mfaChallengeId = response.challenge_id
        this.mfaRememberMe = payload.remember_me ?? false
        this.bootstrapError = null
        this.status = "anonymous"
        return response
      }
      this.setSession(response)
      await this.loadBusinesses()
      return response
    },

    async verifyMfa(code: string) {
      if (!this.mfaChallengeId) throw new Error("MFA challenge is missing")
      const response = await authApi.verifyMfa({
        challenge_id: this.mfaChallengeId,
        code,
        remember_me: this.mfaRememberMe,
      })
      this.setSession(response)
      await this.loadBusinesses()
      return response
    },

    async telegramLogin(
      data: Record<string, string | number>
    ): Promise<TelegramAuthResponse> {
      const response = await authApi.telegramLogin(data)
      if ("status" in response) return response
      this.setSession(response)
      await this.loadBusinesses()
      return response
    },

    async signup(payload: SignupPayload) {
      return authApi.signup(payload)
    },

    async selectBusiness(businessId: string) {
      const business = await authApi.selectBusiness(businessId)
      const index = this.businesses.findIndex((item) => item.id === businessId)
      if (index >= 0) this.businesses[index] = business
      this.activeBusinessId = businessId
      return business
    },

    async createBusiness(payload: BusinessCreatePayload) {
      const business = await authApi.createBusiness(
        payload,
        generatedIdempotencyKey()
      )
      this.businesses.push(business)
      this.activeBusinessId = business.id
      return business
    },

    async logout() {
      bootstrapGeneration += 1
      bootstrapRequest = null
      let failure: unknown
      try {
        await authApi.logout()
      } catch (error) {
        failure = error
      } finally {
        this.clearSession()
      }
      if (failure) throw failure
    },
  },
})
