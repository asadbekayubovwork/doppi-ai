import { HttpError } from "@/shared/api"
import { messageForProblem, retryAfterSeconds } from "../errors"

describe("backend problem UX", () => {
  it("uses stable problem codes and field details without phrase matching", () => {
    const response = new Response(null, { status: 422, statusText: "Unprocessable Entity" })
    const error = new HttpError(response, {
      code: "PASSWORD_POLICY",
      detail: "Use a stronger password.",
      errors: [{ loc: ["body", "new_password"], msg: "Too short" }],
    })

    expect(messageForProblem(error, "Amal bajarilmadi.")).toBe(
      "Use a stronger password."
    )
    expect(messageForProblem(error, "Amal bajarilmadi.", { PASSWORD_POLICY: "Parol talablariga mos emas." })).toBe(
      "Parol talablariga mos emas."
    )
  })

  it("exposes server cooldown timing and falls back safely", () => {
    const response = new Response(null, { status: 429 })
    expect(retryAfterSeconds(new HttpError(response, undefined, 17))).toBe(17)
    expect(retryAfterSeconds(new Error("offline"))).toBe(0)
  })
})
