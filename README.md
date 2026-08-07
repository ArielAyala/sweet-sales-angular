# 🧁 Sweet Sales

A **mobile-first Progressive Web App** for managing sweet shop orders — cakes, cupcakes, cookies and more. Designed for a single user on their phone, storing everything locally on the device with one-tap offline access.

**Sweet Sales** (formerly *SweetSalesAngular*) is built with Angular 22 and Tailwind CSS v4.

## Demo

Try the live app: **[https://sweet-sales.arielayala.me/](https://sweet-sales.arielayala.me/)**

## Features

- **Orders**: create, edit, view and delete orders; mark as **pending** or **completed**; optional delivery date/time; pickup or delivery; **payment method** (cash / transfer); optional **deposit (seña)** with remaining balance; adjust final price at delivery; share a formatted order summary.
- **Order history**: browse past orders grouped by status, with search by customer or order number.
- **Products**: manage product catalog with categories (cakes, cupcakes, cookies, other), prices and descriptions.
- **Sales reports**: view revenue, order count, average order value and best sellers for today / this week / this month / a custom range. Export the report to CSV.
- **Settings**: set **business name**, switch **English** / **Spanish**, choose **currency** (PYG by default, plus USD, EUR, ARS), toggle **dark / light** mode, and **export data** to CSV or JSON.
- **Data ownership**: everything is stored in the browser's `localStorage` — no backend, no remote database. Data can be exported as a backup.
- **Offline-first PWA**: installable and fully functional without an internet connection.

## Tech Stack

- **Framework**: Angular 22 (Standalone Components)
- **Build**: Vite via `@angular/build`
- **Styling**: Tailwind CSS v4
- **State**: Native Angular Signals + Services
- **i18n**: Lightweight in-memory translation dictionaries (ES / EN, runtime switching)
- **Dates**: date-fns
- **PWA**: `@angular/service-worker`
- **Tests**: Vitest

## Getting Started

### Prerequisites

- Node.js (npm 11+)

### Install dependencies

```bash
npm install
```

### Development server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The application reloads automatically when source files change.

> Note: the service worker is only enabled in production builds. During `npm start` the PWA/service worker features are disabled by design.

### Build

```bash
npm run build
```

The production build is output to `dist/sweet-sales-angular/browser`. It includes the service worker (`ngsw-worker.js`), the web app manifest and icons for offline / installable support.

To preview the production build (which enables the service worker):

```bash
npx serve dist/sweet-sales-angular/browser
```

### Run unit tests

```bash
npm test
```

## Project Structure

```
src/app/
├── core/                 # Singleton services & config
│   ├── constants/        # Storage keys, currency definitions
│   ├── i18n/             # Translation dictionaries (en, es)
│   └── services/         # Storage, Settings, Currency, I18n
├── shared/
│   ├── components/       # Button, Modal, Toast, Icon, EmptyState, ...
│   ├── pipes/            # translate, currencyFormat, dateFormat
│   ├── services/         # ToastService
│   └── utils/            # CSV/JSON export, date helpers
├── features/
│   ├── orders/           # Order list, form, detail, service
│   ├── products/         # Product list, form, service
│   ├── reports/          # Sales report + service
│   └── settings/         # Settings page
├── layouts/              # Main layout (sidebar + bottom nav)
└── models/               # Interfaces & types
```

## Scripts

| Command               | Description                              |
| --------------------- | ---------------------------------------- |
| `npm start`           | Run the dev server                       |
| `npm run build`       | Dev build                                |
| `npm run build:prod`  | Production build (with service worker)   |
| `npm test`            | Run unit tests (Vitest)                  |
| `npm run watch`       | Incremental build (development)          |

## Design

- **Theme colors**: pink (`#EC4899`) / purple (`#A855F7`) / amber (`#F59E0B`)
- **Dark mode**: class-based strategy with system preference detection
- **Typography**: system fonts (`system-ui`)

## License

Private project.