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

- Background color: `var(--bg-ground)` (`#0e041f` by default — Tailwind class `bg-ground`)
- Purple theme with gradient accents
- Glassmorphism effects
- Consistent padding: `sm:py-[100px] py-[60px] sm:px-[100px] px-[20px]`
