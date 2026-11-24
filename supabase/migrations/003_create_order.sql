begin;

create function public.create_order(p_name text, p_phone text, p_locale text, p_items jsonb)
returns table (order_number bigint, order_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  customer_name text := regexp_replace(p_name, '^[[:space:]]+|[[:space:]]+$', '', 'g');
  customer_phone text := regexp_replace(p_phone, '^[[:space:]]+|[[:space:]]+$', '', 'g');
  item jsonb;
  requested_product uuid;
  requested_color uuid;
  requested_packs integer;
  seen_colors uuid[] := '{}';
  catalog record;
  valid_lines jsonb := '[]';
  minimum_setting text;
  pairs bigint := 0;
  amount numeric := 0;
  new_id uuid;
  new_number bigint;
begin
  if customer_name is null or char_length(customer_name) not between 1 and 120
    or customer_name ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'Invalid customer name';
  end if;

  if customer_phone is null or char_length(customer_phone) not between 1 and 40
    or customer_phone ~ '[[:cntrl:]]' then
    raise exception using errcode = '22023', message = 'Invalid customer phone';
  end if;

  if p_locale is null or p_locale not in ('ru', 'tg', 'en') then
    raise exception using errcode = '22023', message = 'Invalid locale';
  end if;

  if jsonb_typeof(p_items) is distinct from 'array' then
    raise exception using errcode = '22023', message = 'Order items must be an array';
  end if;
  if jsonb_array_length(p_items) not between 1 and 100 then
    raise exception using errcode = '22023', message = 'Order must contain 1 to 100 items';
  end if;

  select s.value into minimum_setting
    from public.settings as s
    where s.key = 'min_order_amount'
    for share;
  if minimum_setting is null or minimum_setting !~ '^[0-9]{1,28}([.][0-9]{1,2})?$' then
    raise exception using errcode = '55000', message = 'Minimum order amount is not configured correctly';
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    if jsonb_typeof(item) is distinct from 'object'
      or jsonb_typeof(item->'product_id') is distinct from 'string'
      or jsonb_typeof(item->'color_id') is distinct from 'string'
      or jsonb_typeof(item->'packs') is distinct from 'number'
      or item->>'product_id' !~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$'
      or item->>'color_id' !~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}$'
      or item->>'packs' !~ '^[1-9][0-9]{0,4}$' then
      raise exception using errcode = '22023', message = 'Invalid order item';
    end if;

    requested_product := (item->>'product_id')::uuid;
    requested_color := (item->>'color_id')::uuid;
    requested_packs := (item->>'packs')::integer;

    if requested_packs > 10000 or requested_color = any(seen_colors) then
      raise exception using errcode = '22023', message = 'Use one line per color and at most 10000 packs per line';
    end if;
    seen_colors := array_append(seen_colors, requested_color);

    select p.pairs_per_pack, p.price_per_pair, p.min_packs,
      coalesce(
        case p_locale when 'tg' then nullif(btrim(p.name_tg), '')
          when 'en' then nullif(btrim(p.name_en), '') end,
        p.name_ru
      ) as product_name,
      coalesce(
        case p_locale when 'tg' then nullif(btrim(c.name_tg), '')
          when 'en' then nullif(btrim(c.name_en), '') end,
        c.name_ru
      ) as color_name
    into catalog
    from public.products as p
    join public.product_colors as c on c.product_id = p.id
    where p.id = requested_product and c.id = requested_color and p.is_active
    for share of p, c;

    if not found then
      raise exception using errcode = '22023', message = 'Product or color is unavailable';
    end if;
    if requested_packs < catalog.min_packs then
      raise exception using errcode = '22023', message = 'Item is below the minimum pack quantity';
    end if;

    pairs := pairs + requested_packs::bigint * catalog.pairs_per_pack;
    amount := amount + requested_packs::numeric * catalog.pairs_per_pack * catalog.price_per_pair;
    valid_lines := valid_lines || jsonb_build_array(jsonb_build_object(
      'product_id', requested_product,
      'color_id', requested_color,
      'product_name', catalog.product_name,
      'color_name', catalog.color_name,
      'packs', requested_packs,
      'pairs_per_pack', catalog.pairs_per_pack,
      'price_per_pair', catalog.price_per_pair
    ));
  end loop;

  if amount < minimum_setting::numeric then
    raise exception using errcode = '22023', message = 'Order is below the minimum amount';
  end if;

  insert into public.orders as o (customer_name, customer_phone, locale, total_pairs, total_amount)
    values (customer_name, customer_phone, p_locale::public.store_locale, pairs, amount)
    returning o.id, o.order_number into new_id, new_number;

  insert into public.order_items (order_id, product_id, color_id, product_name, color_name,
    packs, pairs_per_pack, price_per_pair)
    select new_id, line.product_id, line.color_id, line.product_name, line.color_name,
      line.packs, line.pairs_per_pack, line.price_per_pair
    from jsonb_to_recordset(valid_lines) as line(
      product_id uuid, color_id uuid, product_name text, color_name text,
      packs integer, pairs_per_pack integer, price_per_pair numeric
    );

  return query select new_number, new_id;
end;
$$;

revoke all on function public.create_order(text, text, text, jsonb) from public, anon, authenticated;
grant execute on function public.create_order(text, text, text, jsonb) to anon, authenticated;

commit;
