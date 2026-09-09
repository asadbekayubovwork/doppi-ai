# App Layer

The App Layer is the entry point of your Vue 3 application, handling global configurations, providers, and application-wide settings.

## 📁 Directory Structure

```
app/
├── layouts/             # Application layouts
│   ├── ui/              # Layout UI components
│   │   └── DefaultLayout.vue  # Default layout component
│   ├── assets/          # Layout-specific assets
│   └── index.ts         # Layouts export
├── providers/           # Global providers
│   ├── i18n.ts          # i18n configuration
│   ├── router.ts        # Router configuration
│   ├── pinia.ts         # Pinia store configuration
│   └── index.ts         # Providers export
├── styles/              # Global styles
│   ├── base.css         # Base styles
│   ├── common.css       # Common styles
│   ├── tailwind.css     # Tailwind directives
│   └── transitions.css  # CSS transitions
├── fonts/               # Application fonts
│   ├── Inter-Regular.*  # Font files (eot, ttf, woff, woff2)
│   └── fonts.css        # Font declarations
├── App.vue              # Root component
└── index.ts             # Application entry point
```

## 🏗 Key Components

### 1. Layouts

Layouts define the overall structure of your application. They are responsible for:
- Defining common page structures
- Managing layout-specific state
- Rendering nested routes

### 2. Providers

Global providers handle application-wide concerns:
- **Router**: Manages navigation and route guards
- **Pinia**: Centralized state management
- **i18n**: Internationalization setup

### 3. Styles

Global styles and theming:
- **Base styles**: CSS resets and base element styles
- **Common styles**: Shared styling rules
- **Tailwind**: Custom Tailwind configuration
- **Transitions**: CSS transitions for animations

### 4. Fonts

Application typography:
- **Inter**: Main application font
- **Font declarations**: CSS font-face rules

## 🚀 Initialization Flow

1. `index.ts` initializes the Vue application
2. Global plugins and providers are registered
3. Root component (`App.vue`) is mounted
4. Application routes are resolved and rendered

## 🛠 Best Practices

- Keep layout components focused on structure, not business logic
- Use dependency injection for global services
- Organize styles by their purpose (base, common, transitions)
- Keep component-specific styles scoped to their components
- Follow the Feature-Sliced Design methodology for organizing code
