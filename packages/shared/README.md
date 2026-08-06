# @aradhya/shared

> Domain layer for Aradhya Seed Store. Analogous to an Android `:core` or `:domain` Gradle module.

## Purpose

Single source of truth for:

- **Types** — `Product`, `Customer`, `Sale`, `SaleItem`, `StockMovement`
- **Supabase client** — typed factory (`createSupabaseClient`)
- **API wrappers** — CRUD + `createSale()` RPC
- **Pure utils** — invoice math, INR formatting, validation helpers

## Do / Don't

| Do | Don't |
|----|-------|
| Add domain types and business rules here | Put React or React Native UI here |
| Add Supabase query wrappers here | Import from `@aradhya/pwa` or `@aradhya/mobile` |
| Keep functions pure where possible | Duplicate calculation logic in client packages |

## Structure

```
src/
├── index.ts              # Public barrel export
├── types/index.ts        # Domain interfaces + STORE_INFO constant
├── supabase/
│   ├── client.ts         # createSupabaseClient()
│   ├── config.ts         # Env validation
│   └── database.ts       # Hand-written DB types (replace with supabase gen types)
├── api/index.ts          # getProducts, createSale, etc.
└── utils/calculations.ts # calcLineAmount, calcBalance, formatINR
```

## Usage

### From PWA (Next.js)

```typescript
import {
  createSupabaseClient,
  getProducts,
  calcBalance,
  STORE_INFO,
} from "@aradhya/shared";

const supabase = createSupabaseClient({
  url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
});

const products = await getProducts(supabase);
```

### From Mobile (Expo)

```typescript
import { createSupabaseClient, getProducts } from "@aradhya/shared";

const supabase = createSupabaseClient({
  url: process.env.EXPO_PUBLIC_SUPABASE_URL!,
  anonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
});
```

## Domain Rules (enforced here and in DB)

- Units: `kg` | `ltr` only
- `amount = quantity × rate` (2 decimal places)
- `balance = total − received`
- Stock cannot go negative on sale (DB RPC rejects)
- HSN required on products and sale lines

## Scripts

```bash
pnpm --filter @aradhya/shared build      # Compile to dist/
pnpm --filter @aradhya/shared dev        # Watch mode
pnpm --filter @aradhya/shared typecheck  # tsc --noEmit
```

## Build Output

Consuming packages import the compiled `dist/` output. Run `pnpm build` at root (or `turbo build`) before production builds of PWA/mobile.

After connecting a live Supabase project, regenerate types:

```bash
supabase gen types typescript --project-id YOUR_ID > src/supabase/database.ts
```
