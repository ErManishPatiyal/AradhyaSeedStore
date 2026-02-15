-- Aradhya Seed Store — Atomic sale deletion with stock revert
-- Apply via Supabase SQL Editor or: supabase db push

-- Deletes a sale, restores product stock, and logs the reversal.
-- Runs in a single transaction so a failure leaves nothing half-applied.
create or replace function public.delete_sale_with_items(p_sale_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item record;
begin
  -- Revert stock for every line item and log the restock movement
  for v_item in
    select product_id, quantity
    from public.sale_items
    where sale_id = p_sale_id
  loop
    update public.products
    set stock_qty = stock_qty + v_item.quantity
    where id = v_item.product_id;

    insert into public.stock_movements (product_id, movement_type, quantity, reference_type, reference_id)
    values (v_item.product_id, 'in', v_item.quantity, 'sale', p_sale_id);
  end loop;

  delete from public.sales
  where id = p_sale_id;

  if not found then
    raise exception 'Sale not found: %', p_sale_id;
  end if;
end;
$$;

-- Allow authenticated clients to call the delete RPC
grant execute on function public.delete_sale_with_items(uuid) to authenticated;
