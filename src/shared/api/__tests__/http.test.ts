import { http } from "../http"
import { HttpError } from "../types"

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  Object.defineProperty(document, "cookie", {
    configurable: true,
    value: "__Host-doppi_csrf=csrf-test",
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe("cookie and CSRF HTTP client", () => {
  it("uses the versioned same-origin API and injects CSRF on unsafe requests", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ status: "ok" }), { status: 200 })
    )

    await http("/auth/login", {
      method: "POST",
      data: { email: "user@example.com", password: "secret" },
    })

    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe("/api/v1/auth/login")
    expect(options.credentials).toBe("same-origin")
    expect(options.headers.get("X-CSRF-Token")).toBe("csrf-test")
    expect(options.headers.get("Content-Type")).toBe("application/json")
  })

  it("does not add a CSRF header to safe reads", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ user: null }), { status: 200 })
    )

    await http("/auth/session", { method: "GET" })

    const [, options] = fetchMock.mock.calls[0]
    expect(options.credentials).toBe("same-origin")
    expect(options.headers.get("X-CSRF-Token")).toBeNull()
  })

  it("parses problem details and Retry-After into HttpError", async () => {
    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "https://docs.doppi.ai/errors/rate-limited",
          title: "Too many requests",
          status: 429,
          code: "RATE_LIMITED",
          detail: "Try again later.",
          trace_id: "trace-123",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/problem+json",
            "Retry-After": "42",
          },
        }
      )
    )

    const promise = http("/auth/email-verifications", {
      method: "POST",
      data: { email: "user@example.com" },
    })
    await expect(promise).rejects.toBeInstanceOf(HttpError)

    await promise.catch((error: HttpError) => {
      expect(error.problem?.code).toBe("RATE_LIMITED")
      expect(error.problem?.trace_id).toBe("trace-123")
      expect(error.retryAfter).toBe(42)
    })
  })

  it("returns null for empty 204 responses", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }))

    await expect(http<void>("/auth/logout", { method: "POST" })).resolves.toBeNull()
  })
})
