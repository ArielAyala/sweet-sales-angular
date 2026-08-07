# AGENTS.md

## Quick Start

**Install & dev server:**
```bash
npm install
npm start
```

Navigate to `http://localhost:4200/`. Service worker is **disabled in dev** (`npm start`) by design; only enabled in production builds.

**Test, build, deploy:**
```bash
npm test                # Vitest; takes ~22s on first run
npm run build           # Dev build (dev mode)
npm run build:prod      # Production build with service worker
npx serve dist/sweet-sales-angular/browser  # Preview prod build
```

## Architecture

- **Single-page PWA** (offline-first): Angular 22 + Vite + Tailwind CSS v4
- **No backend**: all data in browser `localStorage` via `StorageService`
- **Lazy-loaded features**: orders, products, reports, settings (see `src/app/app.routes.ts`)
- **Standalone components** (Angular 22 pattern)
- **State**: Angular Signals + Services (no NgRx or global state manager)

### Project structure
```
src/app/
├── core/
│   ├── services/       StorageService (localStorage), I18nService, SettingsService, CurrencyService
│   ├── constants/      STORAGE_KEYS, currency definitions
│   └── i18n/           Translation dictionaries (en.ts, es.ts)
├── features/           Lazy-loaded route modules (orders, products, reports, settings)
├── shared/             Reusable components, pipes, utilities
├── models/             Interfaces (Order, Product, Settings, etc.)
└── layouts/            MainLayoutComponent (sidebar + bottom nav)
```

## Key Behaviors

1. **Storage**
   - `StorageService.get(key, fallback)` and `set(key, value)` wrap localStorage with JSON serialization
   - `StorageService.clear()` only removes app keys (defined in `STORAGE_KEYS`)
   - All storage write failures are silently ignored (defensive coding for full storage)

2. **i18n**
   - Runtime switching between English and Spanish (no build-time compilation)
   - In-memory dictionaries in `src/app/core/i18n/` 
   - Use `translate` pipe in templates or `I18nService.t(key)` in components

3. **Testing**
   - Vitest with jsdom (browser-like environment)
   - `TestBed.inject()` pattern for service testing
   - Tests clear `localStorage` in `beforeEach`
   - No mocking of `StorageService` needed in most tests (real localStorage in jsdom)

4. **Build & deploy**
   - Entry point: `src/main.ts` → `bootstrapApplication(App, appConfig)`
   - Hash-based routing (`withHashLocation()` in `app.config.ts`)
   - Service worker enabled only when `!isDevMode()`
   - GitHub Pages deployment: `dist/sweet-sales-angular/browser` (see `.github/workflows/deploy.yml`)

## Common Patterns

- **Signals for state**: `signal()` + computed properties, not `BehaviorSubject`
- **Feature routing**: each feature has a `*.routes.ts` file with feature-specific routes
- **Component styling**: Tailwind v4 (PostCSS via `.postcssrc.json`)
- **Dark mode**: class-based strategy with system preference detection
- **CSV/JSON export**: utility functions in `src/app/shared/utils/`

## Watch for

- **Service worker only in production**: `npm start` has no service worker; test offline features via `npx serve dist/...`
- **Hash-based URLs**: routes use `#/path` not `/path` (configured in `app.config.ts`)
- **localStorage quota**: writes silently fail if storage full; app does not alert user
- **TypeScript strict mode**: `noImplicitOverride`, `noPropertyAccessFromIndexSignature`, `noImplicitReturns` all enabled
- **Tailwind v4**: uses new `@tailwindcss/postcss` plugin; different from v3 config syntax

## Formatting & Lint

- **Prettier**: `printWidth: 100`, single quotes, HTML parser: `angular`
- No ESLint configured; Prettier only
- TypeScript compiler in strict mode catches most issues

## Deployment

GitHub Actions on push to `main`:
1. Checkout
2. Setup Node 24
3. `npm ci`
4. `npm run build:prod`
5. Deploy `dist/sweet-sales-angular/browser` to GitHub Pages
