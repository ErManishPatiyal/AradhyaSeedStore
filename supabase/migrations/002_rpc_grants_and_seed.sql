-- Aradhya Seed Store — RPC grants + development seed data
-- Run in Supabase SQL Editor after 001_initial_schema.sql

-- Allow authenticated clients to call the sale RPC
grant execute on function public.create_sale_with_items(uuid, date, jsonb, numeric) to authenticated;

-- ─── Seed products (stock register) ───────────────────────────────────────────
insert into public.products (name, hsn_code, unit, stock_qty, mfg_date, exp_date)
select v.name, v.hsn_code, v.unit, v.stock_qty, v.mfg_date::date, v.exp_date::date
from (
  values
    ('Wheat Seed HD-2967', '1001', 'kg', 250.000, '2025-10-01', '2026-09-30'),
    ('Paddy Seed PR-126', '1001', 'kg', 180.500, '2025-11-15', '2026-11-14'),
    ('Mustard Seed Pusa Bold', '1207', 'kg', 95.000, '2025-09-01', '2026-08-31'),
    ('Maize Hybrid DHM-117', '1005', 'kg', 120.000, '2025-12-01', '2027-11-30'),
    ('Cotton Seed Bt', '1201', 'kg', 75.000, '2025-08-15', '2026-08-14'),
    ('Vegetable Seed Mix', '1209', 'kg', 40.000, '2025-07-01', '2026-06-30'),
    ('Bio Pesticide Neem Oil', '3808', 'ltr', 60.000, '2025-06-01', '2027-05-31'),
    ('Liquid Fertilizer NPK', '3105', 'ltr', 85.500, '2025-05-01', '2026-04-30')
) as v(name, hsn_code, unit, stock_qty, mfg_date, exp_date)
where not exists (select 1 from public.products limit 1);

-- ─── Seed customers ───────────────────────────────────────────────────────────
insert into public.customers (name, address, phone)
select v.name, v.address, v.phone
from (
  values
    ('Ramesh Kumar', 'Village Chhatter, Tehsil Rajgarh', '98765 43210'),
    ('Suresh Singh', 'Near Bus Stand, Chhatter', '98123 45678'),
    ('Anita Devi', 'Ward No. 3, Chhatter', '99887 66554'),
    ('Harish Yadav', 'Kisan Mandi Road, Chhatter', '97654 32109'),
    ('Balbir Singh', 'Village Dharampur, via Chhatter', '96543 21098')
) as v(name, address, phone)
where not exists (select 1 from public.customers limit 1);
