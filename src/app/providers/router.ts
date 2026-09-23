// src/app/providers/router.ts
import { createRouter, createWebHistory } from "vue-router"
import { routes } from "@/pages"
import { useAuthStore } from "@/features/auth"
import { pinia } from "./pinia"
import { safeLocalPath } from "@/features/auth/model/redirect"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    // Header is fixed, so anchor targets are offset to stay clear of it.
    if (to.hash) {
      return { el: to.hash, top: 90, behavior: "smooth" }
    }
    return savedPosition || { top: 0 }
  },
})

// Dev-only escape hatch for UI work while the backend is unavailable.
const authBypass =
  import.meta.env.DEV && import.meta.env.VITE_AUTH_BYPASS === "true"

router.beforeEach(async (to) => {
  if (authBypass && to.meta.requiresAuth === true) return true

  const auth = useAuthStore(pinia)
  const needsSession =
    to.meta.requiresAuth === true || to.meta.guestOnly === true

  if (needsSession && auth.status === "unknown") await auth.bootstrap()

  if (to.meta.requiresAuth === true && !auth.isAuthenticated) {
    return {
      name: "Login",
      query: { redirect: safeLocalPath(to.fullPath) },
    }
  }

  if (to.meta.guestOnly === true && auth.isAuthenticated) {
    return safeLocalPath(to.query.redirect)
  }

  return true
})

export { router, safeLocalPath }
