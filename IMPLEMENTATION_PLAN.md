# Sweet Sales - Implementation Plan

Mobile-first PWA for managing sweet shop orders (cakes, cupcakes, cookies). Single-user application with local persistence, designed to scale to a remote backend in the future.

## Tech Stack

- **Angular:** 22.x (Standalone Components)
- **Build System:** Vite (@angular/build)
- **TypeScript:** 6.x
- **Styling:** Tailwind CSS v4
- **State:** Native Signals + Services
- **i18n:** @ngx-translate/core + @ngx-translate/http-loader
- **Icons:** lucide-angular
- **Dates:** date-fns
- **IDs:** uuid
- **PWA:** @angular/pwa
- **Testing:** Vitest

## Architecture

```
src/app/
├── core/                 # Singleton services, global config
│   ├── services/
│   │   ├── storage.service.ts
│   │   ├── theme.service.ts
│   │   ├── i18n.service.ts
│   │   └── currency.service.ts
│   └── constants/
│       ├── currencies.const.ts
│       └── storage-keys.const.ts
├── shared/               # Reusable components, pipes, utils
├── features/
│   ├── orders/
│   ├── products/
│   ├── reports/
│   └── settings/
├── models/
└── layouts/
```

## Implementation Phases

1. **Infrastructure & Setup** - Dependencies, folder structure, models, core services, PWA, theming
2. **Layout & Navigation** - Main layout, header, bottom nav, sidebar, routing
3. **Shared Components** - Button, Card, Modal, Form inputs, pipes, utils
4. **Products Feature** - CRUD products with categories
5. **Orders Feature** - Create/edit orders, status management, price adjustments, sharing
6. **Reports Feature** - Sales reports by date range
7. **Settings Feature** - Language, currency, theme, data export
8. **Mobile UX Optimization** - Touch targets, FABs, responsive polish
9. **PWA Features & Offline** - Service worker, install prompt
10. **Testing** - Unit tests for critical services
11. **Polish & Bug Fixes**
12. **Documentation**

## Data Models

### Order
- id: string (UUID)
- orderNumber: string (#0001)
- customer: Customer
- items: OrderItem[]
- totalAmount: number
- status: 'pending' | 'completed'
- deliveryType: 'pickup' | 'delivery'
- deliveryDate: Date
- deliveryTime: string
- notes?: string
- priceAdjustments?: PriceAdjustment[]
- createdAt: Date
- updatedAt: Date
- completedAt?: Date

### Product
- id: string (UUID)
- name: string
- category: 'cakes' | 'cupcakes' | 'cookies' | 'other'
- basePrice: number
- description: string
- isActive: boolean
- createdAt: Date
- updatedAt: Date

## LocalStorage Keys

- `sweet-sales-orders`
- `sweet-sales-products`
- `sweet-sales-settings`
- `sweet-sales-last-order-number`

## Design

- **Theme:** Pink (#EC4899) / Purple (#A855F7) / Amber (#F59E0B)
- **Typography:** System fonts
- **Dark mode:** Class strategy via Tailwind
