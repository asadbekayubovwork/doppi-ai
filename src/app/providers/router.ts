// src/app/providers/router.ts
import { createRouter, createWebHistory } from "vue-router"
import { routes } from "@/pages"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    // Header is fixed, so anchor targets are offset to stay clear of it.
    if (to.hash) {
      return { el: to.hash, top: 90, behavior: "smooth" }
    }
    return savedPosition || { top: 0 }
  },
})

// Implement authentication logic
// router.beforeEach((to, from, next) => {
// })

export { router }
