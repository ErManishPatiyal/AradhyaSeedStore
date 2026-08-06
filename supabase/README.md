# Supabase — Database & Auth

> Hosted PostgreSQL backend for Aradhya Seed Store. Free tier at [supabase.com](https://supabase.com).

## Purpose

- Persistent storage for products, customers, sales, stock movements
- Email/password auth for store owner
- Row Level Security (RLS) so only authenticated users access data
- Atomic sale RPC (`create_sale_with_items`) — insert invoice + deduct stock in one transaction

## Schema Overview

| Table | Maps to paper register |
|-------|------------------------|
| `products` | Stock register (name, HSN, qty, MFG/exp dates) |
| `customers` | Customer name & address |
| `sales` | Invoice header (total, received, balance) |
| `sale_items` | Invoice line items (product, HSN, qty, rate, amount) |
| `stock_movements` | Audit trail for stock in/out |

See [migrations/001_initial_schema.sql](./migrations/001_initial_schema.sql) for full DDL.

## Setup (Dashboard — no CLI required)

1. Create a free project at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Go to **SQL Editor** → **New query**.
3. Paste contents of `migrations/001_initial_schema.sql` → **Run**.
4. Go to **Project Settings → API** and copy:
   - Project URL → `SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` / `EXPO_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → corresponding `*_ANON_KEY` vars
5. Go to **Authentication → Users** → create the store owner account.

## Setup (Supabase CLI — optional)

```bash
npm i -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

## Row Level Security

All tables have RLS enabled. Phase 1 policy: **authenticated users have full CRUD**.

The `anon` key is safe in client apps because unauthenticated requests are blocked by RLS. Never expose the `service_role` key in PWA or mobile clients.

## RPC: create_sale_with_items

Called from `@aradhya/shared` → `createSale()`:

```typescript
await client.rpc("create_sale_with_items", {
  p_customer_id: "...",
  p_sale_date: "2026-08-06",
  p_items: [{ product_id, hsn_code, quantity, rate, amount }],
  p_received_amount: 500,
});
```

The function:
1. Locks product rows (`FOR UPDATE`)
2. Rejects if stock would go negative
3. Inserts sale header + line items
4. Decrements `products.stock_qty`
5. Records `stock_movements` audit entry

## Regenerate TypeScript Types

After schema changes, update shared package types:

```bash
supabase gen types typescript --project-id YOUR_ID > packages/shared/src/supabase/database.ts
```

## Local Development (optional)

```bash
supabase start   # Requires Docker — runs local Postgres + Auth
```

For MVP, using the hosted free project is simpler.
