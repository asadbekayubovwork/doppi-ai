# Hero Widget

The Hero widget provides a customizable hero section for landing pages.

## Features

- Customizable title and subtitle
- Configurable primary and secondary buttons
- Responsive design with gradient background
- Smooth transitions and hover effects

## Usage

```vue
<script setup>
import { CHero } from "@/widgets"
</script>

<template>
  <CHero />
</template>
```

## Props

| Prop              | Type     | Default                                        | Description                    |
| ----------------- | -------- | ---------------------------------------------- | ------------------------------ |
| `title`           | `string` | `"Welcome to MyApp"`                           | Hero section title             |
| `subtitle`        | `string` | `"Building the future..."`                     | Hero section subtitle          |
| `primaryButton`   | `object` | `{ text: "Learn More", to: "/about" }`         | Primary button configuration   |
| `secondaryButton` | `object` | `{ text: "Meet the Team", to: "/developers" }` | Secondary button configuration |

## Customization Example

```vue
<template>
  <CHero
    title="Custom Title"
    subtitle="Custom subtitle text"
    :primary-button="{ text: 'Get Started', to: '/signup' }"
    :secondary-button="{ text: 'Learn More', to: '/about' }"
  />
</template>
```
