import { createApp } from "vue"
import App from "./App.vue"
import "./index.css"
import { setupProviders } from "@/app/providers"

const app = createApp(App)

// Setup global providers (Router, Pinia, i18n, etc.)
setupProviders(app)

export { app }
