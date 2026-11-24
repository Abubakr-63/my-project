import { cache } from "react";
import { loadCatalogCurrency } from "./catalog";
import { productImageSource } from "./product-images";
import { createClient } from "./supabase/server";

export const loadProductDetail = cache(async (slug: string) => {
  const supabase = await createClient({ anonymous: true });
  const { data: product, error } = await supabase.from("products")
    .select(`
      id, slug, name_ru, name_tg, name_en, description_ru, description_tg, description_en,
      season, size_range, pairs_per_pack, price_per_pair, min_packs,
      categories!inner(slug, name_ru, name_tg, name_en),
      product_colors(id, name_ru, name_tg, name_en, image_urls)
    `)
    .eq("slug", slug)
    .eq("is_active", true)
    .order("sort_order", { referencedTable: "product_colors" })
    .order("id", { referencedTable: "product_colors" })
    .maybeSingle();

  if (error) throw new Error("Product detail query failed", { cause: error });
  if (!product) return null;

  const currency = await loadCatalogCurrency(supabase);
  const firstImage = productImageSource(product.product_colors[0]?.image_urls[0]);
  const colors = product.product_colors.map(({ image_urls, ...color }) => ({
    ...color,
    images: image_urls.map(productImageSource).filter((image) => image !== null),
  }));

  return { product, currency, firstImage, colors };
});
