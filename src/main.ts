import { app } from "@/app"
import { router } from "@/app/providers/router"

// Each page's HTML ships its SEO tags for crawlers that don't run JavaScript
// (build/seo.ts). Once the app runs, useSeo and App.vue own them; dropping the
// static copies keeps a single canonical and description in the head.
document.head.querySelectorAll("[data-seo]").forEach((tag) => tag.remove())

// Public pages arrive with the page already rendered into #app
// (build/prerender.ts). Mounting clears it, so wait until the route's lazy
// component has loaded — otherwise the static copy blinks out to an empty page.
// A failed first navigation still mounts, so the app can show its error state.
router
  .isReady()
  .catch(() => undefined)
  .then(() => app.mount("#app"))
