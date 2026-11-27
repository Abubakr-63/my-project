import { readProductSearch } from "./product-search";
import type { Database } from "./database.types";
import { createClient } from "./supabase/server";

export const pageSize = 12;
export const seasons = ["spring_autumn", "summer", "winter", "all"] as const satisfies
  readonly Database["public"]["Enums"]["product_season"][];
export const sortOptions = ["newest", "price-asc", "price-desc"] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function readPrice(value: SearchParams[string]) {
  return typeof value === "string" && /^(\d{1,10}(\.\d{1,2})?|\.\d{1,2})$/.test(value)
    ? Number(value)
    : undefined;
}

export function readCatalogQuery(params: SearchParams) {
  const page = typeof params.page === "string" && /^\d{1,7}$/.test(params.page)
    ? Math.max(1, Number(params.page))
    : 1;

  return {
    q: readProductSearch(params.q),
    category: typeof params.category === "string" ? params.category : undefined,
    season: seasons.find((season) => season === params.season),
    minPrice: readPrice(params.minPrice),
    maxPrice: readPrice(params.maxPrice),
    sort: sortOptions.find((sort) => sort === params.sort) ?? "newest",
    page,
  };
}

export type CatalogQuery = ReturnType<typeof readCatalogQuery>;

export function catalogSearch(query: CatalogQuery, page: number) {
  return {
    ...(query.q ? { q: query.q } : {}),
    ...(query.category ? { category: query.category } : {}),
    ...(query.season ? { season: query.season } : {}),
    ...(query.minPrice !== undefined ? { minPrice: String(query.minPrice) } : {}),
    ...(query.maxPrice !== undefined ? { maxPrice: String(query.maxPrice) } : {}),
    ...(query.sort !== "newest" ? { sort: query.sort } : {}),
    ...(page > 1 ? { page: String(page) } : {}),
  };
}

export async function loadCatalogCurrency(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data, error } = await supabase.from("settings").select("value").eq("key", "currency").single();
  if (error) throw new Error("Catalog currency query failed", { cause: error });

  const currency = data.value.trim().toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) throw new Error("Invalid catalog currency setting");
  return currency;
}

export async function loadCatalogOptions() {
  const supabase = await createClient({ anonymous: true });
  const [categoriesResult, currency] = await Promise.all([
    supabase.from("categories").select("id, slug, name_ru, name_tg, name_en")
      .order("sort_order").order("id"),
    loadCatalogCurrency(supabase),
  ]);

  if (categoriesResult.error) throw new Error("Catalog categories query failed", { cause: categoriesResult.error });

  return { categories: categoriesResult.data, currency };
}

export async function loadCatalogProducts(query: CatalogQuery, categoryId?: string) {
  const supabase = await createClient({ anonymous: true });
  let productsQuery = supabase.from("products")
    .select(
      "id, slug, name_ru, name_tg, name_en, price_per_pair, pairs_per_pack, size_range, product_colors(image_urls)",
      { count: "exact" },
    )
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "product_colors" })
    .order("id", { referencedTable: "product_colors" })
    .limit(1, { referencedTable: "product_colors" });

  if (query.q) {
    const match = `%${query.q}%`;
    productsQuery = productsQuery.or(
      `name_ru.ilike.${match},name_tg.ilike.${match},name_en.ilike.${match},slug.ilike.${match}`,
    );
  }
  if (categoryId) productsQuery = productsQuery.eq("category_id", categoryId);
  if (query.season) productsQuery = productsQuery.eq("season", query.season);
  if (query.minPrice !== undefined) productsQuery = productsQuery.gte("price_per_pair", query.minPrice);
  if (query.maxPrice !== undefined) productsQuery = productsQuery.lte("price_per_pair", query.maxPrice);

  if (query.sort !== "newest") {
    productsQuery = productsQuery.order("price_per_pair", { ascending: query.sort === "price-asc" });
  }

  const offset = (query.page - 1) * pageSize;
  const { data, count, error } = await productsQuery
    .order("created_at", { ascending: false })
    .order("id")
    .range(offset, offset + pageSize - 1);

  if (error && (query.page === 1 || error.code !== "PGRST103")) {
    throw new Error("Catalog products query failed", { cause: error });
  }

  return { products: data ?? [], total: count ?? 0 };
}

export type CatalogProduct = Awaited<ReturnType<typeof loadCatalogProducts>>["products"][number];
export type CatalogCategory = Awaited<ReturnType<typeof loadCatalogOptions>>["categories"][number];
