import { http } from "./http"
import type { ApiClientConfig } from "./types"

export const apiClient = {
  get: <T>(url: string, config: Omit<ApiClientConfig, "data"> = {}) => {
    return http<T>(url, { method: "GET", ...config })
  },

  post: <T>(url: string, data?: unknown, config: ApiClientConfig = {}) => {
    return http<T>(url, { method: "POST", data, ...config })
  },

  put: <T>(url: string, data?: unknown, config: ApiClientConfig = {}) => {
    return http<T>(url, { method: "PUT", data, ...config })
  },

  patch: <T>(url: string, data?: unknown, config: ApiClientConfig = {}) => {
    return http<T>(url, { method: "PATCH", data, ...config })
  },

  delete: <T>(url: string, config: ApiClientConfig = {}) => {
    return http<T>(url, { method: "DELETE", ...config })
  },
}
