export { default as CTable } from "./Table/ui/CTable.vue"

// Chrome
export { CHeader } from "./header"
export { CDashboardHeader } from "./dashboard-header"
export { CDashboardSidebar } from "./dashboard-sidebar"
export { CFooter } from "./footer"

// Landing sections (in page order)
export { CHero } from "./hero"
export { CTrustBar } from "./trustbar"
export { CProblem } from "./problem"
export { CSolution } from "./solution"
export { CFeatures } from "./features"
export { CAudience } from "./audience"
export { CHowItWorks } from "./howitworks"
export { CVoiceAgent } from "./voiceagent"
export { CResults } from "./results"
export { CPricingList } from "./pricing"
export { CFaq } from "./faq"
export { CAbout } from "./about"
export { CTeamCards } from "./team"
export { CContact } from "./contact"

// Service pages (/rag-agent, /voice-agent, /video-generator)
export {
  CServiceHero,
  CServiceFeatures,
  CServiceSteps,
  CServiceLinks,
  CServiceCta,
} from "./service"

// Shared shells for the bespoke service landings, and the mockups each one shows
export {
  CLandingHero,
  CLandingSteps,
  CLandingCapabilities,
  CLandingCta,
  HERO_PRIMARY,
  HERO_SECONDARY,
  BAND_PRIMARY,
  BAND_SECONDARY,
} from "./service-landing"
export {
  CDemoInstagram,
  CDemoLeads,
  CDemoCall,
  CDemoResult,
} from "./voice-landing"
export {
  CDemoKnowledgeBase,
  CDemoTelegram,
  CDemoConversations,
} from "./rag-landing"
export {
  CDemoContentPlan,
  CDemoQueue,
  CDemoPostStats,
  CDemoWeekResult,
} from "./video-landing"
