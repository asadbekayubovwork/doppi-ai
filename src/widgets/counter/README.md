# Counter Widget

A simple widget that demonstrates how to use entities in the widget layer following FSD architecture.

## Structure

```
counter/
├── ui/                 # UI components
│   └── CounterWidget.vue # Widget component
└── index.ts            # Public API
```

## Usage

```vue
<script setup>
import { CounterWidget } from '@/widgets/counter'
</script>

<template>
  <CounterWidget />
</template>
```

## Features

- Displays a counter with controls
- Shows derived state (double count)
- Tracks last update time
- Demonstrates proper layer usage (widget → entity)
