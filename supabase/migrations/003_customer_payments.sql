-- Aradhya Seed Store — customer payment ledger
-- Run in Supabase SQL Editor after 001_initial_schema.sql

-- ─── Customer Payments (repayment ledger) ────────────────────────────────────
create table if not exists public.customer_payments (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references public.customers (id) on delete restrict,
  amount       numeric(12, 2) not null check (amount > 0),
  payment_date date not null default current_date,
  notes        text,
  created_at   timestamptz not null default now()
);

create index if not exists customer_payments_customer_id_idx
  on public.customer_payments (customer_id);

create index if not exists customer_payments_payment_date_idx
  on public.customer_payments (payment_date desc);

-- ─── Row Level Security ──────────────────────────────────────────────────────
alter table public.customer_payments enable row level security;

create policy "Authenticated full access on customer_payments"
  on public.customer_payments for all
  to authenticated
  using (true)
  with check (true);
