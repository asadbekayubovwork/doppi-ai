import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vite"
import vue from "@vitejs/plugin-vue"

/**
 * Origin that serves the documented API (https://doppiai.uz/api/docs).
 * Override with VITE_API_PROXY_TARGET to develop against a staging backend.
 */
const API_PROXY_TARGET =
  process.env.VITE_API_PROXY_TARGET || "https://doppiai.uz"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 3000,
    // The control plane allowlists a single browser origin and hands out
    // HttpOnly `__Host-` session cookies, so calling it straight from
    // localhost fails preflight ("Disallowed CORS origin") and could not keep
    // the cookie anyway. Proxying keeps the browser on one origin, which is
    // what production does too — the app ships the same relative `/api/v1`
    // base URL in both places.
    proxy: {
      "/api": {
        target: API_PROXY_TARGET,
        changeOrigin: true,
        secure: true,
        // `__Host-` cookies must carry no Domain attribute; strip it from any
        // others so the browser stores them against localhost.
        cookieDomainRewrite: "",
        configure: (proxy) => {
          proxy.on("proxyReq", (proxyReq) => {
            // Present the dev request as the allowlisted origin so nothing
            // downstream rejects it on an origin check.
            proxyReq.setHeader("origin", API_PROXY_TARGET)
            proxyReq.setHeader("referer", `${API_PROXY_TARGET}/`)
          })
        },
      },
    },
  },
  css: {
    preprocessorOptions: {},
  },
})
