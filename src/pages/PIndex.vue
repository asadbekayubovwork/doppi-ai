<script setup lang="ts">
import { useSeo } from "@/shared/lib"
import {
  CHero,
  CTrustBar,
  CSolution,
  CFeatures,
  CVideoShowcase,
  CHowItWorks,
  CResults,
  CFaq,
  CAbout,
} from "@/widgets"

useSeo("/")
</script>

<template>
  <div>
    <CHero />
    <CTrustBar />
    <CSolution />
    <CFeatures />
    <CVideoShowcase />
    <CHowItWorks />
    <CResults />
    <CFaq />
    <CAbout />
  </div>
</template>
