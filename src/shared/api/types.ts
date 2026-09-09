/**
 * A configuration object for our HTTP client, similar to Axios.
 */
export interface ApiClientConfig extends Omit<RequestInit, "body"> {
  /** Appended to the URL as a query string; values are stringified. */
  params?: Record<string, string | number | boolean>
  /** Replaces `body` for a more Axios-like feel — JSON-encoded before sending. */
  data?: unknown
}

/**
 * A custom error class that holds the response object and status.
 * TanStack Query will receive this error on promise rejection.
 */
export class HttpError extends Error {
  response: Response
  status: number

  constructor(response: Response) {
    super(`HTTP Error: ${response.status} ${response.statusText}`)
    this.name = "HttpError"
    this.response = response
    this.status = response.status
  }
}
