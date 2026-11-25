begin;

lock table public.products, public.product_colors in share row exclusive mode;

-- Bring older catalog rows into compliance before enforcing the rule.
update public.products as product
set is_active = false
where product.is_active and not exists (
  select 1 from public.product_colors as color where color.product_id = product.id
);

create function public.check_active_product_color()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  checked_id uuid;
  active boolean;
begin
  if tg_table_name = 'products' then
    checked_id := new.id;
  else
    checked_id := old.product_id;
  end if;

  -- Serialize color removal and activation on the parent row.
  select product.is_active into active
  from public.products as product
  where product.id = checked_id
  for no key update;

  -- A missing parent is expected during a cascading product delete.
  if active and not exists (
    select 1 from public.product_colors as color where color.product_id = checked_id
  ) then
    if tg_table_name = 'products' then
      raise sqlstate 'SH001' using message = 'Active product requires a color';
    end if;
    raise sqlstate 'SH002' using message = 'Cannot remove the last color of an active product';
  end if;
  return null;
end;
$$;

revoke all on function public.check_active_product_color() from public, anon, authenticated;

create constraint trigger active_product_color_required
after insert or update of is_active on public.products
deferrable initially deferred
for each row execute function public.check_active_product_color();

create constraint trigger active_product_keeps_color
after delete or update of product_id on public.product_colors
deferrable initially deferred
for each row execute function public.check_active_product_color();

commit;
