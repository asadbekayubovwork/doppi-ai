/**
 * A configuration object for our HTTP client, similar to Axios.
 */
export interface ApiClientConfig extends Omit<RequestInit, "body"> {
  /** Appended to the URL as a query string; values are stringified. */
  params?: Record<string, string | number | boolean>
  /** Replaces `body` for a more Axios-like feel — JSON-encoded before sending. */
  data?: unknown
}

export interface ApiProblemError {
  loc?: Array<string | number>
  msg?: string
}

export interface ApiProblem {
  type?: string
  title?: string
  status?: number
  code?: string
  detail?: string
  instance?: string
  trace_id?: string
  errors?: ApiProblemError[]
}

export class HttpError extends Error {
  response: Response
  status: number
  problem?: ApiProblem
  retryAfter?: number

  constructor(
    response: Response,
    problem?: ApiProblem,
    retryAfter?: number
  ) {
    super(`HTTP Error: ${response.status} ${response.statusText}`)
    this.name = "HttpError"
    this.response = response
    this.status = response.status
    this.problem = problem
    this.retryAfter = retryAfter
  }
}
