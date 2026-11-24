begin;

create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins where user_id = (select auth.uid()));
$$;

revoke all on function public.is_admin() from public, anon, authenticated;
grant execute on function public.is_admin() to authenticated;

grant select on public.categories, public.products, public.product_colors, public.settings to anon;
grant select, insert, update, delete on public.categories, public.products,
  public.product_colors, public.orders, public.order_items, public.settings, public.admins
  to authenticated;

create policy "Read categories" on public.categories
  for select to anon, authenticated using (true);
create policy "Read active products" on public.products
  for select to anon, authenticated using (is_active);
create policy "Read colors of active products" on public.product_colors
  for select to anon, authenticated using (
    exists (
      select 1 from public.products
      where id = product_colors.product_id and is_active
    )
  );
create policy "Read public settings" on public.settings
  for select to anon, authenticated using (key in ('whatsapp_number', 'min_order_amount', 'currency'));

create policy "Admins manage categories" on public.categories
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage products" on public.products
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage colors" on public.product_colors
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage orders" on public.orders
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage order items" on public.order_items
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage settings" on public.settings
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));
create policy "Admins manage admin membership" on public.admins
  for all to authenticated using ((select public.is_admin())) with check ((select public.is_admin()));

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

create policy "Read product images" on storage.objects
  for select to anon, authenticated using (bucket_id = 'product-images');
create policy "Admins upload product images" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'product-images' and (select public.is_admin())
  );
create policy "Admins update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and (select public.is_admin()))
  with check (bucket_id = 'product-images' and (select public.is_admin()));
create policy "Admins delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select public.is_admin()));


-- Restrictive policies preserve the bucket boundary if another policy allows broader writes.
create policy "Restrict product image inserts" on storage.objects
  as restrictive for insert to anon, authenticated
  with check (
    case when bucket_id is distinct from 'product-images' then true
      when current_user = 'authenticated' then (select public.is_admin())
      else false end
  );
create policy "Restrict product image updates" on storage.objects
  as restrictive for update to anon, authenticated
  using (
    case when bucket_id is distinct from 'product-images' then true
      when current_user = 'authenticated' then (select public.is_admin())
      else false end
  )
  with check (
    case when bucket_id is distinct from 'product-images' then true
      when current_user = 'authenticated' then (select public.is_admin())
      else false end
  );
create policy "Restrict product image deletes" on storage.objects
  as restrictive for delete to anon, authenticated
  using (
    case when bucket_id is distinct from 'product-images' then true
      when current_user = 'authenticated' then (select public.is_admin())
      else false end
  );

commit;
