import { HttpError } from "@/shared/api"

type ProblemMessages = Record<string, string>

export const messageForProblem = (
  error: unknown,
  fallback: string,
  messages: ProblemMessages = {}
) => {
  if (!(error instanceof HttpError)) return fallback
  const code = error.problem?.code
  if (code && messages[code]) return messages[code]
  return error.problem?.detail || fallback
}

export const retryAfterSeconds = (error: unknown) =>
  error instanceof HttpError && error.retryAfter !== undefined
    ? error.retryAfter
    : 0

export const isProblemCode = (error: unknown, code: string) =>
  error instanceof HttpError && error.problem?.code === code
