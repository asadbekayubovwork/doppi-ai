# Header Widget

The Header widget provides the main navigation bar for the application.

## Features

- Responsive navigation menu
- Active route highlighting
- Clean and modern design

## Usage

```vue
<script setup>
import { CHeader } from "@/widgets"
</script>

<template>
  <CHeader />
</template>
```

## Navigation Items

The header includes links to:

- Services (dropdown)
- Pricing
- About Us
- Resources (dropdown, includes Contact)

Modify the `navigation` array in the component to add or remove navigation items.

## Dropdown menus

"Services" and "Resources" both open on hover through `CNavMenu`. Services is
two columns side by side: the live services, then the upcoming ones (Market
Radar, personal blogs, farmers, sole proprietors). Resources is a single list
(blog, languages, contact).
Their content lives in `model/navMenus.ts`; labels come from `services.menu.*` and `nav.*` in the
locale files. An item without `to` renders with a "Coming soon" tag instead of
a link — give it a `to` once its page exists. The mobile drawer has no
dropdowns and lists only the live pages.
