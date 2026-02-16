-- Aradhya Seed Store — Atomic sale line item deletion
-- Apply via Supabase SQL Editor or: supabase db push

-- Deletes a single line item from a sale, reverts the product stock,
-- logs the restock movement, and recomputes the sale totals.
-- Refuses to delete the last remaining item (delete the sale instead).
-- Returns the sale id so the client can refresh.
create or replace function public.delete_sale_item(p_sale_item_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sale_id    uuid;
  v_product_id uuid;
  v_quantity   numeric(12, 3);
  v_item_count int;
  v_new_total  numeric(12, 2);
  v_received   numeric(12, 2);
begin
  select sale_id, product_id, quantity
  into v_sale_id, v_product_id, v_quantity
  from public.sale_items
  where id = p_sale_item_id;

  if not found then
    raise exception 'Sale item not found: %', p_sale_item_id;
  end if;

  select count(*) into v_item_count
  from public.sale_items
  where sale_id = v_sale_id;

  if v_item_count <= 1 then
    raise exception 'Cannot delete the only item on a sale; delete the sale instead';
  end if;

  -- Revert stock and log the restock movement
  update public.products
  set stock_qty = stock_qty + v_quantity
  where id = v_product_id;

  insert into public.stock_movements (product_id, movement_type, quantity, reference_type, reference_id)
  values (v_product_id, 'in', v_quantity, 'sale', v_sale_id);

  -- Remove the item and recompute totals
  delete from public.sale_items
  where id = p_sale_item_id;

  select coalesce(sum(amount), 0) into v_new_total
  from public.sale_items
  where sale_id = v_sale_id;

  select received_amount into v_received
  from public.sales
  where id = v_sale_id;

  update public.sales
  set total_amount   = round(v_new_total, 2),
      balance_amount = round(v_new_total - v_received, 2)
  where id = v_sale_id;

  return v_sale_id;
end;
$$;

-- Allow authenticated clients to call the delete RPC
grant execute on function public.delete_sale_item(uuid) to authenticated;
