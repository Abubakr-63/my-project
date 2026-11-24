begin;

create type public.product_season as enum ('spring_autumn', 'summer', 'winter', 'all');
create type public.store_locale as enum ('ru', 'tg', 'en');
create type public.order_status as enum ('new', 'in_progress', 'done', 'cancelled');

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug <> ''),
  name_ru text not null check (name_ru ~ '[^[:space:]]'),
  name_tg text,
  name_en text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug <> ''),
  category_id uuid not null references public.categories(id),
  name_ru text not null check (name_ru ~ '[^[:space:]]'),
  name_tg text,
  name_en text,
  description_ru text,
  description_tg text,
  description_en text,
  season public.product_season not null default 'all',
  price_per_pair numeric(12, 2) not null check (price_per_pair >= 0 and price_per_pair <> 'NaN'::numeric),
  pairs_per_pack integer not null check (pairs_per_pack > 0),
  size_range text not null check (size_range ~ '[^[:space:]]'),
  min_packs integer not null default 1 check (min_packs > 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_colors (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name_ru text not null check (name_ru ~ '[^[:space:]]'),
  name_tg text,
  name_en text,
  image_urls text[] not null default '{}',
  sort_order integer not null default 0,
  unique (product_id, id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number bigint generated always as identity (start with 1001) unique,
  customer_name text not null check (customer_name ~ '[^[:space:]]' and char_length(customer_name) <= 120),
  customer_phone text not null check (customer_phone ~ '[^[:space:]]' and char_length(customer_phone) <= 40),
  locale public.store_locale not null,
  status public.order_status not null default 'new',
  total_pairs bigint not null check (total_pairs > 0),
  total_amount numeric(30, 2) not null check (total_amount >= 0 and total_amount <> 'NaN'::numeric),
  created_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid not null references public.products(id),
  color_id uuid not null,
  product_name text not null,
  color_name text not null,
  packs integer not null check (packs > 0),
  pairs_per_pack integer not null check (pairs_per_pack > 0),
  price_per_pair numeric(12, 2) not null check (price_per_pair >= 0 and price_per_pair <> 'NaN'::numeric),
  line_total numeric(30, 2) generated always as (packs::numeric * pairs_per_pack * price_per_pair) stored not null,
  constraint order_items_product_color_fkey foreign key (product_id, color_id)
    references public.product_colors(product_id, id),
  unique (order_id, color_id)
);

create table public.settings (
  key text primary key,
  value text not null
);

create table public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade
);

create index products_category_id_idx on public.products(category_id);
create index order_items_product_color_idx on public.order_items(product_id, color_id);

create function public.set_product_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

revoke all on function public.set_product_updated_at() from public, anon, authenticated;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_product_updated_at();

insert into public.settings (key, value) values
  ('whatsapp_number', ''),
  ('min_order_amount', '0'),
  ('currency', 'TJS');

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_colors enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.settings enable row level security;
alter table public.admins enable row level security;

-- Keep the schema closed even before the policy migration is applied.
revoke all on table public.categories, public.products, public.product_colors,
  public.orders, public.order_items, public.settings, public.admins
  from public, anon, authenticated;
revoke all on sequence public.orders_order_number_seq from public, anon, authenticated;

commit;
