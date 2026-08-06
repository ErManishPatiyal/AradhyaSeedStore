-- Aradhya Seed Store — initial schema
-- Apply via Supabase SQL Editor or: supabase db push

-- ─── Extensions ─────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ─── Products (Stock Register) ───────────────────────────────────────────────
create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  hsn_code    text not null,
  unit        text not null check (unit in ('kg', 'ltr')),
  stock_qty   numeric(12, 3) not null default 0 check (stock_qty >= 0),
  mfg_date    date,
  exp_date    date,
  created_at  timestamptz not null default now()
);

create index if not exists products_name_idx on public.products (name);
create index if not exists products_exp_date_idx on public.products (exp_date);

-- ─── Customers ───────────────────────────────────────────────────────────────
create table if not exists public.customers (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  phone       text,
  created_at  timestamptz not null default now()
);

create index if not exists customers_name_idx on public.customers (name);

-- ─── Sales (Invoice Header) ──────────────────────────────────────────────────
create table if not exists public.sales (
  id               uuid primary key default gen_random_uuid(),
  customer_id      uuid not null references public.customers (id) on delete restrict,
  sale_date        date not null default current_date,
  total_amount     numeric(12, 2) not null check (total_amount >= 0),
  received_amount  numeric(12, 2) not null default 0 check (received_amount >= 0),
  balance_amount   numeric(12, 2) not null default 0,
  created_at       timestamptz not null default now()
);

create index if not exists sales_customer_id_idx on public.sales (customer_id);
create index if not exists sales_sale_date_idx on public.sales (sale_date desc);

-- ─── Sale Line Items ─────────────────────────────────────────────────────────
create table if not exists public.sale_items (
  id          uuid primary key default gen_random_uuid(),
  sale_id     uuid not null references public.sales (id) on delete cascade,
  product_id  uuid not null references public.products (id) on delete restrict,
  hsn_code    text not null,
  quantity    numeric(12, 3) not null check (quantity > 0),
  rate        numeric(12, 2) not null check (rate >= 0),
  amount      numeric(12, 2) not null check (amount >= 0)
);

create index if not exists sale_items_sale_id_idx on public.sale_items (sale_id);

-- ─── Stock Movements (Audit Trail) ───────────────────────────────────────────
create table if not exists public.stock_movements (
  id             uuid primary key default gen_random_uuid(),
  product_id     uuid not null references public.products (id) on delete restrict,
  movement_type  text not null check (movement_type in ('in', 'out')),
  quantity       numeric(12, 3) not null check (quantity > 0),
  reference_type text check (reference_type in ('sale', 'purchase', 'adjustment')),
  reference_id   uuid,
  created_at     timestamptz not null default now()
);

create index if not exists stock_movements_product_id_idx on public.stock_movements (product_id);

-- ─── Atomic Sale Creation RPC ────────────────────────────────────────────────
-- Items JSON shape: [{ "product_id": "uuid", "hsn_code": "...", "quantity": 1, "rate": 100, "amount": 100 }]
create or replace function public.create_sale_with_items(
  p_customer_id     uuid,
  p_sale_date       date,
  p_items           jsonb,
  p_received_amount numeric
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id       uuid;
  v_total         numeric(12, 2) := 0;
  v_balance       numeric(12, 2);
  v_item          jsonb;
  v_product_id    uuid;
  v_quantity      numeric(12, 3);
  v_rate          numeric(12, 2);
  v_amount        numeric(12, 2);
  v_hsn           text;
  v_current_stock numeric(12, 3);
begin
  if jsonb_array_length(p_items) = 0 then
    raise exception 'Sale must have at least one line item';
  end if;

  -- Validate stock availability and compute total
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity   := (v_item->>'quantity')::numeric;
    v_rate       := (v_item->>'rate')::numeric;
    v_amount     := round(v_quantity * v_rate, 2);

    select stock_qty into v_current_stock
    from public.products
    where id = v_product_id
    for update;

    if not found then
      raise exception 'Product not found: %', v_product_id;
    end if;

    if v_current_stock - v_quantity < 0 then
      raise exception 'Insufficient stock for product %', v_product_id;
    end if;

    v_total := v_total + v_amount;
  end loop;

  v_balance := round(v_total - p_received_amount, 2);

  insert into public.sales (customer_id, sale_date, total_amount, received_amount, balance_amount)
  values (p_customer_id, p_sale_date, v_total, p_received_amount, v_balance)
  returning id into v_sale_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item->>'product_id')::uuid;
    v_quantity   := (v_item->>'quantity')::numeric;
    v_rate       := (v_item->>'rate')::numeric;
    v_amount     := round(v_quantity * v_rate, 2);
    v_hsn        := v_item->>'hsn_code';

    insert into public.sale_items (sale_id, product_id, hsn_code, quantity, rate, amount)
    values (v_sale_id, v_product_id, v_hsn, v_quantity, v_rate, v_amount);

    update public.products
    set stock_qty = stock_qty - v_quantity
    where id = v_product_id;

    insert into public.stock_movements (product_id, movement_type, quantity, reference_type, reference_id)
    values (v_product_id, 'out', v_quantity, 'sale', v_sale_id);
  end loop;

  return v_sale_id;
end;
$$;

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table public.products enable row level security;
alter table public.customers enable row level security;
alter table public.sales enable row level security;
alter table public.sale_items enable row level security;
alter table public.stock_movements enable row level security;

-- Authenticated users (store owner) have full access — Phase 1 single-user model
create policy "Authenticated full access on products"
  on public.products for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated full access on customers"
  on public.customers for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated full access on sales"
  on public.sales for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated full access on sale_items"
  on public.sale_items for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated full access on stock_movements"
  on public.stock_movements for all
  to authenticated
  using (true)
  with check (true);
