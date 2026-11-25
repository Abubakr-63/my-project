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
  const value = field(form, "slug", 100);
  return value && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value) ? value : null;
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
  const price = field(form, "price_per_pair", 13);
  const pairs_per_pack = integer(form, "pairs_per_pack", 1, 2147483647);
  const min_packs = integer(form, "min_packs", 1, MAX_PACKS_PER_LINE);
  const size_range = field(form, "size_range", 80);
  const description_ru = field(form, "description_ru", 5000);
  const description_tg = field(form, "description_tg", 5000);
  const description_en = field(form, "description_en", 5000);

  if (!labels || !value || !isCartId(category_id) || !validSeason || !price ||
    !/^\d{1,10}(\.\d{1,2})?$/.test(price) || pairs_per_pack === null || min_packs === null ||
    !size_range || description_ru === null || description_tg === null || description_en === null) return null;

  return {
    ...labels, slug: value, category_id, season: validSeason, price_per_pair: Number(price),
    pairs_per_pack, min_packs, size_range, description_ru: description_ru || null,
    description_tg: description_tg || null, description_en: description_en || null,
  };
}

export function validateColor(form: FormData, supabaseUrl: string | undefined) {
  const labels = names(form);
  const sort_order = integer(form, "sort_order", 0, 2147483647);
  const images = field(form, "image_urls", 20000);
  if (!labels || sort_order === null || images === null) return null;

  const image_urls = images.split(/\r?\n/).map((url) => url.trim()).filter(Boolean);
  const host = supabaseUrl ? URL.parse(supabaseUrl)?.host : undefined;
  for (const input of image_urls) {
    const url = URL.parse(input);
    if (!url || url.protocol !== "https:" || !host || url.host !== host ||
      url.username || url.password || url.search || url.hash ||
      !url.pathname.startsWith("/storage/v1/object/public/product-images/") ||
      url.pathname === "/storage/v1/object/public/product-images/") return null;
  }

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
  const value = typeof params.q === "string" ? params.q.trim() : "";
  const q = value.length <= 80 && /^[\p{L}\p{M}\p{N} -]+$/u.test(value) ? value : "";
  const category = isCartId(params.category) ? params.category : "";
  return { page, status, q, category };
}
