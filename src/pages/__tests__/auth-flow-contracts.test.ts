import { readFileSync } from "node:fs"
import { join } from "node:path"

import { API_BASE_URL } from "@/shared/config/api"

const page = (name: string) =>
  readFileSync(join(process.cwd(), "src/pages", name), "utf8")

const authApiSource = readFileSync(
  join(process.cwd(), "src/features/auth/api/authApi.ts"),
  "utf8"
)

describe("auth pages use real backend flows", () => {
  it("does not contain demo OTP, auth bypass, or bearer token persistence", () => {
    const source = ["PLogin.vue", "PRegister.vue", "PForgotPassword.vue"]
      .map(page)
      .join("\n")
      .concat(authApiSource)

    expect(source).not.toContain("111111")
    expect(source).not.toContain("VITE_AUTH_API_ENABLED")
    expect(source).not.toContain("authToken")
    expect(source).not.toContain("Bearer")
  })

  it("uses the backend provider contracts and reset challenge sequence", () => {
    const source = ["PLogin.vue", "PRegister.vue", "PForgotPassword.vue"]
      .map(page)
      .join("\n")
      .concat(authApiSource)

    // The prefix now resolves in one place, so assert the value the client
    // actually sends against rather than grepping the feature source.
    expect(API_BASE_URL).toBe("/api/v1")
    expect(source).toContain('"/auth/oauth/google/authorize"')
    expect(source).toContain("verifyPasswordReset")
    expect(source).toContain("confirmPasswordReset")
    expect(source).toContain("remember_me")
  })
})
