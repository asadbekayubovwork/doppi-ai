import type { App } from "vue"
import { pinia } from "./pinia"
import { router } from "./router"
import { i18n } from "./i18n"
import AOS from "aos"
import "aos/dist/aos.css"

export function setupProviders(app: App) {
  app.use(pinia)
  app.use(router)
  app.use(i18n)
  app.use(AOS)
  // `once: true` — an element that has already animated in is never hidden
  // again. With the default (`once: false`) AOS strips `aos-animate` whenever it
  // recalculates positions, which made height-changing content (the FAQ
  // accordion, the contact form's success state) fade out on interaction and
  // only come back on the next scroll.
  AOS.init({ once: true })
}
