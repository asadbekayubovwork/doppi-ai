import { defineStore } from "pinia"
import {
  authApi,
  type Business,
  type BusinessCreatePayload,
  type LoginResponse,
  type SessionResponse,
  type SignInPayload,
  type SignupPayload,
  type User,
} from "../api/authApi"
import { safeLocalPath } from "./redirect"

export type AuthStatus = "unknown" | "loading" | "authenticated" | "anonymous"

const isMfaResponse = (
  response: LoginResponse
): response is Extract<LoginResponse, { status: "mfa_required" }> =>
  response.status === "mfa_required"

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
    bootstrapError: null as unknown,
  }),

  getters: {
    isAuthenticated: (state) => state.status === "authenticated",
    activeBusiness: (state) =>
      state.businesses.find((business) => business.id === state.activeBusinessId) ??
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
      this.bootstrapError = null
    },

    clearSession() {
      this.session = null
      this.user = null
      this.businesses = []
      this.activeBusinessId = null
      this.mfaChallengeId = null
      this.status = "anonymous"
    },

    async loadBusinesses() {
      this.businesses = await authApi.listBusinesses()
      if (
        this.activeBusinessId === null ||
        !this.businesses.some((business) => business.id === this.activeBusinessId)
      ) {
        this.activeBusinessId = this.businesses[0]?.id ?? null
      }
    },

    async bootstrap(force = false) {
      if (!force && (this.status === "loading" || this.status === "authenticated")) {
        return this.isAuthenticated
      }

      this.status = "loading"
      this.bootstrapError = null
      try {
        const response = await authApi.getSession()
        this.setSession(response)
        await this.loadBusinesses()
        return true
      } catch (error) {
        this.bootstrapError = error
        this.clearSession()
        return false
      }
    },

    async login(payload: SignInPayload): Promise<LoginResponse> {
      this.status = "loading"
      try {
        const response = await authApi.signIn(payload)
        if (isMfaResponse(response)) {
          this.mfaChallengeId = response.challenge_id
          this.bootstrapError = null
          this.status = "anonymous"
          return response
        }
        this.setSession(response)
        await this.loadBusinesses()
        return response
      } catch (error) {
        this.clearSession()
        throw error
      }
    },

    async verifyMfa(code: string) {
      if (!this.mfaChallengeId) throw new Error("MFA challenge is missing")
      const response = await authApi.verifyMfa({
        challenge_id: this.mfaChallengeId,
        code,
      })
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
      const business = await authApi.createBusiness(payload, generatedIdempotencyKey())
      this.businesses.push(business)
      this.activeBusinessId = business.id
      return business
    },

    async logout() {
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
