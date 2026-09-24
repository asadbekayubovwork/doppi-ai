const AUTH_ENTRY_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/auth/callback",
])

export const safeLocalPath = (value: unknown, fallback = "/app"): string => {
  if (
    typeof value !== "string" ||
    !value.startsWith("/") ||
    value.startsWith("//")
  ) {
    return fallback
  }

  try {
    const parsed = new URL(value, "https://local.invalid")
    const pathname = decodeURIComponent(parsed.pathname)
    if (
      parsed.origin !== "https://local.invalid" ||
      pathname.includes("\\") ||
      pathname.split("/").includes("..") ||
      AUTH_ENTRY_PATHS.has(pathname) ||
      !(
        pathname === "/admin" ||
        pathname === "/app" ||
        pathname.startsWith("/app/")
      )
    ) {
      return fallback
    }
    return `${parsed.pathname}${parsed.search}${parsed.hash}`
  } catch {
    return fallback
  }
}
