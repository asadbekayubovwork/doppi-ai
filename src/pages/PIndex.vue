<script setup lang="ts">
import { useSeo } from "@/shared/lib"
import {
  CHero,
  CTrustBar,
  CSolution,
  CFeatures,
  CHowItWorks,
  CResults,
  CFaq,
  CAbout,
  CContact,
} from "@/widgets"

useSeo("/")
</script>

<template>
  <div>
    <CHero />
    <CTrustBar />
    <CSolution />
    <CFeatures />
    <CHowItWorks />
    <CResults />
    <CFaq />
    <CAbout />
    <CContact />
  </div>
</template>
