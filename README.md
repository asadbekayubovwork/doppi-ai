# Vue 3 FSD Boilerplate

A production-ready Vue 3 boilerplate following Feature-Sliced Design (FSD) architecture. This template provides a solid foundation for building scalable and maintainable Vue 3 applications with TypeScript, Vite, and modern tooling.

## 🚀 Features

- ⚡ **Vue 3** - Composition API & `<script setup>`
- 🏗 **Feature-Sliced Design** - Scalable and maintainable architecture
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 📦 **Vite** - Next Generation Frontend Tooling
- 🔍 **TypeScript** - Static type checking
- 🛠 **ESLint + Prettier** - Code quality and formatting
- 📱 **Responsive** - Mobile-first approach
- 🌐 **i18n Ready** - Built-in internationalization support
- 🧪 **Testing** - Unit and component testing setup

## 🛠 Tech Stack

- [Vue 3](https://v3.vuejs.org/) - Progressive JavaScript Framework
- [Vite](https://vitejs.dev/) - Next Generation Frontend Tooling
- [TypeScript](https://www.typescriptlang.org/) - Type-Safe JavaScript
- [Pinia](https://pinia.vuejs.org/) - Intuitive Vue Store
- [Vue Router](https://router.vuejs.org/) - Official Router for Vue.js
- [Tailwind CSS](https://tailwindcss.com/) - A utility-first CSS framework
- [ESLint](https://eslint.org/) - Pluggable JavaScript linter
- [Prettier](https://prettier.io/) - Opinionated Code Formatter
- [Vitest](https://vitest.dev/) - Blazing Fast Unit Test Framework

## 📦 Getting Started

### Prerequisites

- Node.js 20+ (LTS recommended)
- pnpm 9+ (recommended)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/vue3-fsd-boilerplate.git
   cd vue3-fsd-boilerplate
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Environment Setup**

   - Copy `.env.example` to `.env`
   - Update environment variables as needed

4. **Explore the Demo**
   - Start the development server with `pnpm dev`
   - Navigate to `/demo` route to see the counter demo
   - Explore the code in `src/entities/counter` and `src/widgets/counter`

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm test:coverage` - Generate test coverage report
- `pnpm test:ui` - Open Vitest UI
- `pnpm lint` - Lint and fix files
- `pnpm lint:fix` - Fix linting issues
- `pnpm prettier` - Check formatting
- `pnpm prettier:fix` - Fix formatting issues
- `pnpm format` - Run both prettier and lint fixes

## 🏗 Project Architecture

This project follows **Feature-Sliced Design (FSD)** methodology, which organizes code by features rather than technical concerns. This promotes better separation of concerns, maintainability, and scalability.

### Core FSD Layers

1. **App Layer** (`/src/app/`)

   - Application entry point
   - Global providers and configurations
   - Application initialization
   - Root layout and styles

2. **Pages Layer** (`/src/pages/`)

   - Top-level route components
   - Page composition and data loading
   - Minimal business logic

3. **Features Layer** (`/src/features/`)

   - Self-contained business features
   - Feature-specific components and logic
   - Example: `clients/`, `auth/`

4. **Entities Layer** (`/src/entities/`)

   - Core business models and logic
   - Reusable across multiple features
   - Example: `user/`, `product/`

5. **Shared Layer** (`/src/shared/`)

   - Reusable utilities and components
   - UI components, API clients, constants
   - Not specific to any feature/entity

6. **Widgets Layer** (`/src/widgets/`)
   - Composed UI blocks
   - Reusable across different pages
   - Example: `client-card/`, `data-table/`

### Data Flow

- **Unidirectional data flow** from parent to child components
- **State management** through Pinia stores
- **API communication** through dedicated API layers
- **Dependency direction**: Pages → Features → Entities → Shared

## 📂 Project Structure

```
├── public/                      # Static files
│   ├── favicon.ico              # Favicon
│   └── robots.txt              # Robots configuration
├── src/
│   ├── app/                    # Application core
│   │   ├── layouts/             # Application layouts
│   │   ├── providers/           # Global providers (router, store, etc.)
│   │   ├── styles/             # Global styles
│   │   ├── App.vue              # Root component
│   │   └── main.ts              # Application entry point
│   │
│   ├── pages/                 # Page components
│   │   ├── index.ts             # Pages entry point
│   │   └── clients/             # Example: Clients page
│   │
│   ├── features/              # Feature modules
│   │   └── clients/             # Example: Clients feature
│   │       ├── api/             # API integration
│   │       ├── components/      # Feature components
│   │       ├── model/           # Business logic
│   │       └── index.ts         # Public API
│   │
│   ├── entities/              # Business entities
│   │   └── client/              # Example: Client entity
│   │       ├── api/             # API integration
│   │       ├── model/           # Business logic
│   │       ├── ui/              # UI components
│   │       └── index.ts         # Public API
│   │
│   ├── shared/                # Shared resources
│   │   ├── api/                 # API clients
│   │   ├── config/             # Configuration
│   │   ├── lib/                # Utilities
│   │   └── ui/                 # UI components
│   │
│   └── widgets/               # Reusable widgets
│       └── client-card/         # Example: Client card widget
│
├── .env                       # Environment variables
├── .eslintrc.js               # ESLint configuration
├── .prettierrc                # Prettier configuration
├── index.html                 # HTML template
├── package.json               # Project configuration
├── tsconfig.json              # TypeScript configuration
└── vite.config.ts             # Vite configuration
```

## 📚 Documentation

### Project Organization

- **[GitHub Labels Organization](docs/GITHUB_LABELS.md)** - Comprehensive labeling system for issues and pull requests, following FSD architecture principles

### Counter Demo Example

This project includes a simple counter demo that showcases the FSD architecture with Pinia state management, API layer, and testing. You can view the demo at `/` route.

```
src/
├── entities/
│   └── counter/                 # Counter entity
│       ├── api/                 # API layer
│       │   ├── counterApi.ts    # API client for counter
│       │   ├── types.ts         # API types and DTOs
│       │   └── index.ts         # API public exports
│       ├── model/               # Business logic
│       │   ├── counter.store.ts # Pinia store for counter
│       │   └── __tests__/       # Unit tests
│       ├── ui/                  # UI components
│       │   ├── CounterDisplay.vue # Counter display component
│       │   └── __tests__/       # Component tests
│       └── index.ts             # Public API
├── widgets/
│   └── counter/                 # Counter widget
│       ├── ui/                  # Widget components
│       │   └── CounterWidget.vue # Widget component
│       └── index.ts             # Public API
└── pages/
    └── PIndex.vue                 # Demo page
```

### Key Components:

1. **Entities/Counter**

   - Simple counter entity with Pinia store
   - API layer with mock implementation (simulates real API calls)
   - Demonstrates state, getters, actions, and async operations
   - Includes loading and error handling states
   - Includes unit tests for the store with API mocking
   - Includes component tests for the UI with various states

2. **Widgets/Counter**

   - Composes the counter entity into a widget
   - Shows proper layer usage (widget → entity)

3. **Pages/PIndex**
   - Demo page that showcases the counter widget
   - Simple route configuration

## 🧪 Testing

This project includes setup for both unit and component testing with Vitest:

- **Unit Tests**: Test business logic and utilities (see counter store tests)
- **Component Tests**: Test Vue components in isolation (see CounterDisplay tests)

### Counter Demo Tests

The counter demo includes examples of both unit and component tests with API layer integration:

1. **Store Tests** (`src/entities/counter/model/__tests__/counter.store.test.ts`):

   - Tests initial state and API initialization
   - Tests async actions with API mocking (increment, decrement, reset)
   - Tests getters (doubleCount, isPositive)
   - Tests loading states and error handling
   - Demonstrates proper API mocking techniques

2. **Component Tests** (`src/entities/counter/ui/__tests__/CounterDisplay.test.ts`):
   - Tests rendering with different props and states (loading, error, normal)
   - Tests user interactions (button clicks)
   - Tests component reactivity with store state changes
   - Tests conditional rendering based on API states

### Running Tests

```bash
# Run all tests
pnpm test

# Watch mode for development
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Open Vitest UI
pnpm test:ui
```

## 🛡️ Security

- **Dependencies**: Regular updates using `pnpm audit`
- **Environment Variables**: Never commit sensitive data
- **CORS**: Properly configured in `vite.config.ts`
- **Content Security Policy**: Implemented for production builds

## 🔄 Deployment

### Production Build

```bash
# Build for production
pnpm build

# Preview production build locally
pnpm preview
```

### Environment Variables

Create a `.env` file in the root directory with the necessary environment variables:

```env
VITE_API_BASE_URL=your_api_url_here
VITE_APP_TITLE="Vue 3 FSD Boilerplate"
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
