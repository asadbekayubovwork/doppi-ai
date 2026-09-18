<script setup lang="ts">
import { useSeo } from "@/shared/lib"
import {
  CHero,
  CTrustBar,
  CProblem,
  CSolution,
  CFeatures,
  CHowItWorks,
  CVoiceAgent,
  CResults,
  CPricingList,
  CFaq,
  CAbout,
  CTeamCards,
  CContact,
} from "@/widgets"

useSeo("/")
</script>

<template>
  <div>
    <CHero />
    <CTrustBar />
    <CProblem />
    <CSolution />
    <CFeatures />
    <CHowItWorks />
    <CVoiceAgent />
    <CResults />
    <CPricingList />
    <CFaq />
    <CAbout />
    <CTeamCards />
    <CContact />
  </div>
</template>
