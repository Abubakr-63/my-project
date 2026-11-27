import { readProductSearch } from "@/lib/product-search";
import type { Database } from "@/lib/database.types";
import { isCartId, MAX_PACKS_PER_LINE } from "@/lib/cart";

type Season = Database["public"]["Enums"]["product_season"];
export const settingKeys = ["whatsapp_number", "min_order_amount", "currency"] as const;
export type SettingKey = (typeof settingKeys)[number];

function field(form: FormData, name: string, max: number) {
  const value = form.get(name);
  return typeof value === "string" && value.trim().length <= max ? value.trim() : null;
}

function names(form: FormData) {
  const name_ru = field(form, "name_ru", 160);
  const name_tg = field(form, "name_tg", 160);
  const name_en = field(form, "name_en", 160);
  if (!name_ru || name_tg === null || name_en === null) return null;
  return { name_ru, name_tg: name_tg || null, name_en: name_en || null };
}

function slug(form: FormData) {
  const value = field(form, "slug", 60);
  return value && value.length >= 2 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : null;
}

function integer(form: FormData, key: string, min: number, max: number) {
  const value = field(form, key, 10);
  if (!value || !/^\d+$/.test(value)) return null;
  const number = Number(value);
  return number >= min && number <= max ? number : null;
}

export function validateCategory(form: FormData) {
  const labels = names(form);
  const value = slug(form);
  const sort_order = integer(form, "sort_order", 0, 2147483647);
  return labels && value && sort_order !== null ? { ...labels, slug: value, sort_order } : null;
}

export function validateProduct(form: FormData) {
  const labels = names(form);
  const value = slug(form);
  const category_id = form.get("category_id");
  const season = form.get("season");
  const seasons: readonly Season[] = ["spring_autumn", "summer", "winter", "all"];
  const validSeason = seasons.find((candidate) => candidate === season);
  const price = field(form, "price_per_pair", 10);
  const pairs_per_pack = integer(form, "pairs_per_pack", 1, 100);
  const min_packs = integer(form, "min_packs", 1, MAX_PACKS_PER_LINE);
  const size_range = field(form, "size_range", 20);
  const description_ru = field(form, "description_ru", 5000);
  const description_tg = field(form, "description_tg", 5000);
  const description_en = field(form, "description_en", 5000);

  if (!labels || !value || !isCartId(category_id) || !validSeason || !price ||
    !/^\d{1,7}(\.\d{1,2})?$/.test(price) || Number(price) <= 0 || Number(price) > 1000000 || pairs_per_pack === null || min_packs === null ||
    (!size_range || !/^[0-9]{2,3}(-[0-9]{2,3})?$/.test(size_range)) || description_ru === null || description_tg === null || description_en === null) return null;

  return {
    ...labels, slug: value, category_id, season: validSeason, price_per_pair: Number(price),
    pairs_per_pack, min_packs, size_range, description_ru: description_ru || null,
    description_tg: description_tg || null, description_en: description_en || null,
  };
}

const colorImagePrefix = "/storage/v1/object/public/product-images/";

export function colorImagePath(input: string, supabaseUrl: string | undefined) {
  const host = supabaseUrl ? URL.parse(supabaseUrl)?.host : undefined;
  const url = URL.parse(input);
  if (!url || url.protocol !== "https:" || !host || url.host !== host ||
    url.username || url.password || url.search || url.hash ||
    !url.pathname.startsWith(colorImagePrefix) || url.pathname === colorImagePrefix) return null;

  try {
    const path = decodeURIComponent(url.pathname.slice(colorImagePrefix.length));
    if (path.split("/").some((segment) => !segment || segment === "." || segment === "..") ||
      /[\\\p{Cc}]/u.test(path)) return null;
    return path;
  } catch {
    return null;
  }
}

export function validateColor(form: FormData, supabaseUrl: string | undefined) {
  const labels = names(form);
  const sort_order = integer(form, "sort_order", 0, 2147483647);
  const images = form.get("image_urls");
  if (!labels || sort_order === null || typeof images !== "string" || images.length > 5018) return null;

  const lines = images.split(/\r?\n/);
  if (lines.length > 10 || lines.some((line) => line.length > 500)) return null;
  const image_urls = lines.map((url) => url.trim()).filter(Boolean);
  if (image_urls.some((url) => !colorImagePath(url, supabaseUrl))) return null;

  return { ...labels, sort_order, image_urls };
}

export function validateSetting(key: unknown, form: FormData) {
  const setting = settingKeys.find((candidate) => candidate === key);
  const value = field(form, "value", 40);
  if (!setting || value === null) return null;

  if (setting === "whatsapp_number") {
    const digits = value.replace(/[+ -]/g, "");
    return value === "" || /^[0-9]{8,15}$/.test(digits) ? { key: setting, value: digits } : null;
  }
  if (setting === "min_order_amount") {
    return /^\d{1,28}(\.\d{1,2})?$/.test(value) ? { key: setting, value } : null;
  }
  return /^[A-Za-z]{3}$/.test(value) ? { key: setting, value: value.toUpperCase() } : null;
}

export function productFilters(params: Record<string, string | string[] | undefined>) {
  const page = typeof params.page === "string" && /^[1-9]\d{0,3}$/.test(params.page) ? Number(params.page) : 1;
  const status = params.active === "active" || params.active === "inactive" ? params.active : "all";
  const q = readProductSearch(params.q);
  const category = isCartId(params.category) ? params.category : "";
  return { page, status, q, category };
}
