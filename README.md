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

### Production deploys

Every push to `main` runs [`.github/workflows/ci-cd.yml`](.github/workflows/ci-cd.yml)
on a GitHub-hosted runner: tests, lint, type-check and `pnpm audit`, then a
production build. The build is streamed over SSH to the production host
(`doppiai@34.27.103.62`, SSH port 8800), where
[`deploy/doppiai-release.sh`](deploy/doppiai-release.sh) — installed as
`/usr/local/bin/doppiai-release` — makes it live. The workflow finishes by
checking that <https://doppiai.uz> serves the new bundle.

On the host each deploy unpacks into `/var/www/doppiai.uz/releases/<name>` and
the `current` symlink that nginx serves is swapped in one step, so visitors
never see a half-copied site. The five newest releases are kept, and `previous`
always points at the one to roll back to.

The CI key is pinned to that script with a forced command, so it can only
`activate` or `rollback` — no shell, file transfer or tunnels. The server also
hosts another project, which is why the key stored in GitHub must not be the
admin key.

#### One-time setup

1. Install the release script (repeat whenever `deploy/doppiai-release.sh`
   changes — CI cannot update it):

   ```bash
   scp -P 8800 deploy/doppiai-release.sh doppiai@34.27.103.62:/tmp/
   ssh -p 8800 doppiai@34.27.103.62 'sudo install -m 755 /tmp/doppiai-release.sh /usr/local/bin/doppiai-release && rm /tmp/doppiai-release.sh'
   ```

2. Authorize a dedicated CI key by appending its public key to
   `~doppiai/.ssh/authorized_keys` on the host, prefixed with the restriction:

   ```text
   restrict,command="/usr/local/bin/doppiai-release" ssh-ed25519 AAAA... github-actions@doppi-ai
   ```

3. Add the private half as the repository secret `DEPLOY_SSH_KEY`
   (GitHub → Settings → Secrets and variables → Actions).

The workflow pins the host's SSH keys instead of trusting them on first use. If
the server is ever rebuilt, replace them in the workflow with the output of
`ssh-keyscan -p 8800 34.27.103.62`.

#### Manual deploy and rollback

From Windows, with the admin key at `~/.ssh/doppiai_gcp`:

```powershell
.\deploy.ps1              # build, upload, switch, verify
.\deploy.ps1 -SkipBuild   # ship the existing dist/
.\deploy.ps1 -Rollback    # back to the previous release (run again to undo)
```

The CI key can roll back too: `ssh -p 8800 -i <ci-key> doppiai@34.27.103.62 rollback`.

#### nginx

[`deploy/nginx/doppiai.uz.conf`](deploy/nginx/doppiai.uz.conf) is the server's
site config (with the ACME snippet next to it). It maps `/voice-agent` to the
prebuilt `voice-agent.html` described below and sends every other route to the
`noindex` app shell. After editing it:

```bash
scp -P 8800 deploy/nginx/doppiai.uz.conf doppiai@34.27.103.62:/tmp/
ssh -p 8800 doppiai@34.27.103.62 'sudo install -m 644 /tmp/doppiai.uz.conf /etc/nginx/sites-available/doppiai.uz && sudo nginx -t && sudo systemctl reload nginx'
```

### Search engines

The pages meant for search are listed once, in
[`src/shared/config/seoPages.ts`](src/shared/config/seoPages.ts). For each one
the build ([`build/seo.ts`](build/seo.ts)) writes `<path>.html` carrying that
page's title, description, canonical link, Open Graph tags and schema.org data
(organization, services, breadcrumbs, FAQ), and lists it in `sitemap.xml`.
Crawlers that don't run JavaScript — link previews in Telegram and Facebook,
Google's first pass — therefore see each page as it is. Every other route gets
`app.html`, marked `noindex`, so sign-in and the dashboard stay out of results.

To publish a new page: add its route, add `seo.<key>.title` and
`seo.<key>.description` in all three locale files, then add it to `SEO_PAGES`.
The static HTML uses the default locale (`uz`); `useSeo` keeps the tags right
after a language switch.

### Environment Variables

The frontend talks to the Do'ppi control plane, whose contract is published as
Swagger at <https://doppiai.uz/api/docs> (raw spec: `/api/openapi.json`). Every
documented path is versioned under `/api/v1`, and `src/shared/config/api.ts` is
the single place that resolves it — features call bare paths such as
`apiClient.post("/auth/login")`.

Nothing has to be configured to run locally. `pnpm dev` proxies `/api` to the
API origin, which matters because the backend allowlists one browser origin and
issues HttpOnly `__Host-` session cookies: a direct call from `localhost` fails
preflight with `400 Disallowed CORS origin` and could not keep the cookie.
Proxying keeps the browser same-origin in development, exactly as in production.

Override any of these in a `.env` file:

```env
# Prefix every request is resolved against. A relative value keeps the API
# same-origin; an absolute one switches fetch to credentials: "include" and
# needs that origin allowlisted by the backend.
VITE_API_BASE_URL=/api/v1

# Backend the dev server proxies /api to (development only).
VITE_API_PROXY_TARGET=https://doppiai.uz
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
