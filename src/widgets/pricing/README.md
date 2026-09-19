# Pricing Widget

This widget displays a responsive pricing section with multiple pricing plans.

## Features

- Three pricing tiers (Pricing, Pro, Business)
- Highlighted middle tier (Pro plan)
- Feature lists with checkmarks
- Responsive design for mobile, tablet, and desktop
- Hover effects and animations
- AOS animation support

## Usage

```vue
<script setup>
import { CPricingList } from "@/widgets/pricing"
</script>

<template>
  <CPricingList />
</template>
```

## Styling

The component follows the same styling patterns as other landing sections:

- Background color: `var(--bg-ground)` (`#FDFCFC` by default — Tailwind class `bg-ground`)
- Light theme: white cards on the `sand` neutrals, ink (`sand-950`) for the popular plan
- Hairline borders and soft shadows
- Consistent padding: `sm:py-[100px] py-[60px] sm:px-[100px] px-[20px]`
