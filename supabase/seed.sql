begin;

insert into public.categories (slug, name_ru, name_tg, name_en, sort_order) values
  ('sample-sneakers', 'Кроссовки', 'Кроссовкаҳо', 'Sneakers', 10),
  ('sample-sandals', 'Сандалии', 'Сандалҳо', 'Sandals', 20)
on conflict (slug) do nothing;

insert into public.products (
  slug, category_id, name_ru, name_tg, name_en, season,
  price_per_pair, pairs_per_pack, size_range, min_packs
)
select sample.slug, category.id, sample.name_ru, sample.name_tg, sample.name_en,
  sample.season::public.product_season, sample.price, sample.pairs, sample.sizes, sample.min_packs
from (values
  ('sample-city-sneaker', 'sample-sneakers', 'Городские кроссовки', 'Кроссовкаҳои шаҳрӣ',
    'City sneaker', 'spring_autumn', 95.00, 6, '36-41', 2),
  ('sample-breeze-sandal', 'sample-sandals', 'Летние сандалии', 'Сандалҳои тобистона',
    'Breeze sandal', 'summer', 70.00, 6, '36-41', 1)
) as sample(slug, category_slug, name_ru, name_tg, name_en, season, price, pairs, sizes, min_packs)
join public.categories as category on category.slug = sample.category_slug
on conflict (slug) do nothing;

insert into public.product_colors (id, product_id, name_ru, name_tg, name_en, sort_order)
select sample.id::uuid, product.id, sample.name_ru, sample.name_tg, sample.name_en, sample.sort_order
from (values
  ('61aab215-e48f-42cf-a06f-f4e9087d3de0', 'sample-city-sneaker', 'Белый', 'Сафед', 'White', 10),
  ('e5e136cf-829c-4a74-82df-7086b4612bc7', 'sample-city-sneaker', 'Чёрный', 'Сиёҳ', 'Black', 20),
  ('d9eae018-5743-43b7-8d47-aeef56c0439a', 'sample-breeze-sandal', 'Бежевый', 'Беж', 'Beige', 10),
  ('d06f913f-dd7c-46c5-ac6f-9189708462a4', 'sample-breeze-sandal', 'Чёрный', 'Сиёҳ', 'Black', 20)
) as sample(id, product_slug, name_ru, name_tg, name_en, sort_order)
join public.products as product on product.slug = sample.product_slug
on conflict (id) do nothing;

commit;
