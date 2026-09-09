import { fileURLToPath, URL } from "node:url"

import { defineConfig } from "vitest/config"
import vue from "@vitejs/plugin-vue"

export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true,
    environment: "jsdom",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
  resolve: {
    alias: {
      // Must be an absolute path — a relative "./src" leaves `@/...` imports
      // unresolved when tests run from a nested directory.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
