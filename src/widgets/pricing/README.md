# Pricing Widgets

The sections of the `/pricing` page. Prices, credit amounts and costs come from
`@/entities/pricing` (`model/plans.ts`); the copy lives under `pricing.*` in the
i18n files. There is no checkout yet: plan buttons lead to `/register` (Business
to `/contact-us`) and top-up packs to `/contact-us`.

- `CPricingList` — monthly / yearly toggle and the three plan cards
  (`CPricingCards` from the entity, also shown in the dashboard top-up dialog).
- `CCreditCosts` — what each service charges in credits, with the dollar
  equivalent at 1 credit = $0.004.
- `CTopUpPacks` — one-off credit packs on top of a plan.

The page's FAQ is the shared `CFaq` widget pointed at `pricing.faq`.

```vue
<script setup>
import { CCreditCosts, CFaq, CPricingList, CTopUpPacks } from "@/widgets"
</script>

<template>
  <CPricingList />
  <CCreditCosts />
  <CTopUpPacks />
  <CFaq base="pricing.faq" />
</template>
```
