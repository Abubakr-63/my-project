import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowForwardIcon, ImageIcon } from "@/components/ui/icons";
import { localizedName, type StoreLocale } from "@/lib/catalog-format";
import type { HomeData } from "@/lib/home";
import { Link } from "@/lib/navigation";
import { productImageSource } from "@/lib/product-images";

export async function FeaturedProducts({ products, locale }: { products: HomeData["featured"]; locale: StoreLocale }) {
  if (!products.length) return null;
  const t = await getTranslations({ locale });
  return (
    <section aria-labelledby="featured-title">
      <h2 id="featured-title" className="mb-4 text-headline-medium">{t("Home.featuredTitle")}</h2>
      <ul className="home-featured-row flex snap-x snap-mandatory gap-4 overflow-x-auto p-2">
        {products.map((product) => {
          const name = localizedName(product, locale);
          const image = productImageSource(product.product_colors[0]?.image_urls[0]);
          return (
            <li key={product.id} className="w-[min(64vw,14rem)] shrink-0 snap-start">
              <Link href={`/catalog/${encodeURIComponent(product.slug)}`} prefetch={false}
                className="home-featured-card ui-card-elevated block h-full overflow-hidden">
                <div className="relative grid aspect-[4/3] place-items-center bg-surface-container-high text-on-surface-variant">
                  {image ? (
                    <Image src={image} alt={t("Catalog.imageAlt", { name })}
                      fill sizes="(max-width: 350px) 64vw, 224px" loading="lazy" className="object-cover" />
                  ) : <ImageIcon size={32} />}
                </div>
                <h3 className="flex items-center justify-between gap-2 p-4 text-title-medium">
                  <span className="min-w-0 wrap-anywhere">{name}</span><ArrowForwardIcon size={18} className="shrink-0 text-primary" />
                </h3>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
