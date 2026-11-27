import { ImageIcon } from "@/components/ui/icons";
import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import type { CatalogProduct } from "@/lib/catalog";
import { formatPrice, localizedName, type StoreLocale } from "@/lib/catalog-format";
import { productImageSource } from "@/lib/product-images";

export async function ProductCard({
  product, currency, locale,
}: {
  product: CatalogProduct;
  currency: string;
  locale: StoreLocale;
}) {
  const t = await getTranslations("Catalog");
  const name = localizedName(product, locale);
  const image = productImageSource(product.product_colors[0]?.image_urls[0]);
  const pairPrice = formatPrice(product.price_per_pair, currency, locale);
  const packPrice = formatPrice(product.price_per_pair * product.pairs_per_pack, currency, locale);

  return (
    <Link
      href={`/catalog/${encodeURIComponent(product.slug)}`}
      className="group block h-full overflow-hidden ui-card-elevated ui-interactive-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
    >
      <div className="relative grid aspect-square place-items-center bg-surface-container">
        {image ? (
          <Image
            src={image}
            alt={t("imageAlt", { name })}
            fill
            loading="lazy"
            sizes="(min-width: 1280px) 270px, (min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover"
          />
        ) : (
          <span className="px-2 text-center text-sm text-on-surface-variant"><ImageIcon size={28} className="mx-auto mb-2" />{t("noImage")}</span>
        )}
      </div>
      <div className="space-y-2 p-3 wrap-anywhere sm:p-4">
        <h2 className="font-semibold group-hover:underline">{name}</h2>
        <p className="font-medium">{t("perPair", { price: pairPrice })}</p>
        <p className="text-sm text-on-surface-variant">{t("perPack", { price: packPrice })}</p>
        <div className="space-y-1 border-t border-outline-variant pt-2 text-sm text-on-surface-variant">
          <p>{t("sizes", { range: product.size_range })}</p>
          <p>{t("pairsPerPack", { count: product.pairs_per_pack })}</p>
        </div>
      </div>
    </Link>
  );
}
