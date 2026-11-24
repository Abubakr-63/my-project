import { loadCatalogCurrency } from "@/lib/catalog";
import { localizedName, type StoreLocale } from "@/lib/catalog-format";
import { lineKey, type CartLine } from "@/lib/cart";
import type { CartDetails } from "@/lib/cart/details";
import { productImageSource } from "@/lib/product-images";
import { createClient } from "@/lib/supabase/server";

const CART_QUERY_BATCH_SIZE = 40;

export async function loadCartDetails(ids: readonly Pick<CartLine, "productId" | "colorId">[], locale: StoreLocale) {
  const supabase = await createClient({ anonymous: true });
  const batches: (typeof ids)[] = [];
  for (let offset = 0; offset < ids.length; offset += CART_QUERY_BATCH_SIZE) {
    batches.push(ids.slice(offset, offset + CART_QUERY_BATCH_SIZE));
  }

  const [productBatches, currency, minimum] = await Promise.all([
    Promise.all(batches.map((batch) => supabase.from("products").select(`
      id, slug, name_ru, name_tg, name_en, is_active, price_per_pair, pairs_per_pack, min_packs,
      product_colors(id, name_ru, name_tg, name_en, image_urls)
    `).eq("is_active", true)
      .in("id", [...new Set(batch.map(({ productId }) => productId))])
      .in("product_colors.id", [...new Set(batch.map(({ colorId }) => colorId))]))),
    loadCatalogCurrency(supabase),
    supabase.from("settings").select("value").eq("key", "min_order_amount").single(),
  ]);

  if (minimum.error) throw new Error("Cart catalog query failed");
  const amount = minimum.data.value;
  if (!/^[0-9]{1,28}(\.[0-9]{1,2})?$/.test(amount)) throw new Error("Invalid minimum order amount");

  const items: CartDetails["items"] = {};
  productBatches.forEach((products, index) => {
    if (products.error) throw new Error("Cart catalog query failed");
    for (const line of batches[index]) {
      const product = products.data.find(({ id }) => id === line.productId);
      const color = product?.product_colors.find(({ id }) => id === line.colorId);
      if (!product?.is_active || !color) continue;

      items[lineKey(line)] = {
        slug: product.slug,
        name: localizedName(product, locale),
        color: localizedName(color, locale),
        image: productImageSource(color.image_urls[0]),
        pricePerPair: product.price_per_pair,
        pairsPerPack: product.pairs_per_pack,
        minPacks: product.min_packs,
      };
    }
  });

  return { items, currency, minimumOrderAmount: Number(amount) } satisfies CartDetails;
}
