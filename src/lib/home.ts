import { normalizeWhatsAppNumber } from "./checkout/whatsapp";
import { createClient } from "./supabase/server";

export async function loadHome() {
  const supabase = await createClient({ anonymous: true });
  const [featured, categories, settings] = await Promise.all([
    supabase.from("products")
      .select("id, slug, name_ru, name_tg, name_en, product_colors(image_urls)")
      .eq("is_active", true)
      .not("product_colors.image_urls", "eq", "{}")
      .order("created_at", { ascending: false }).order("id")
      .order("sort_order", { referencedTable: "product_colors" })
      .order("id", { referencedTable: "product_colors" })
      .limit(1, { referencedTable: "product_colors" })
      .limit(6),
    supabase.from("categories").select("id, slug, name_ru, name_tg, name_en")
      .order("sort_order").order("id"),
    supabase.from("settings").select("key, value").in("key", ["currency", "min_order_amount", "whatsapp_number"]),
  ]);

  const values = new Map(settings.data?.map(({ key, value }) => [key, value]));
  const rawMinimum = values.get("min_order_amount") ?? "";
  const currency = values.get("currency")?.trim().toUpperCase();
  const minimum = /^\d{1,28}(\.\d{1,2})?$/.test(rawMinimum) ? Number(rawMinimum) : 0;
  return {
    featured: featured.data ?? [],
    categories: categories.data ?? [],
    phone: normalizeWhatsAppNumber(values.get("whatsapp_number")),
    minimumOrder: minimum > 0 && currency && /^[A-Z]{3}$/.test(currency) ? { amount: minimum, currency } : null,
  };
}

export type HomeData = Awaited<ReturnType<typeof loadHome>>;
