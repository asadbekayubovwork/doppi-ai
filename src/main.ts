import { app } from "@/app"

// Each page's HTML ships its SEO tags for crawlers that don't run JavaScript
// (build/seo.ts). Once the app runs, useSeo and App.vue own them; dropping the
// static copies keeps a single canonical and description in the head.
document.head.querySelectorAll("[data-seo]").forEach((tag) => tag.remove())

app.mount("#app")
