import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { ProductOptions } from "@/components/product/product-options";
import { formatPrice, localizedField, localizedName } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";
import { loadProductDetail } from "@/lib/product-detail";
import { routing } from "@/lib/routing";

type ProductPageProps = PageProps<"/[locale]/catalog/[slug]">;
const openGraphLocales = { ru: "ru_RU", tg: "tg_TJ", en: "en_US" };

function previewDescription(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  const characters = Array.from(text);
  return characters.length > 150 ? `${characters.slice(0, 149).join("").trimEnd()}…` : text;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  const detail = await loadProductDetail(slug);
  if (!detail) notFound();

  const { product, currency, firstImage } = detail;
  const t = await getTranslations({ locale });
  const name = localizedName(product, locale);
  const siteName = t("Site.name");
  const title = t("Product.metaTitle", { name, siteName });
  const description = previewDescription(
    localizedField(product, "description", locale) ??
      t("Product.metaDescription", {
        category: localizedName(product.categories, locale),
        price: formatPrice(product.price_per_pair, currency, locale),
      }),
  );

  const siteUrl = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000");
  const languages = {
    ru: new URL(`/ru/catalog/${encodeURIComponent(product.slug)}`, siteUrl).href,
    tg: new URL(`/tg/catalog/${encodeURIComponent(product.slug)}`, siteUrl).href,
    en: new URL(`/en/catalog/${encodeURIComponent(product.slug)}`, siteUrl).href,
  };
  const url = languages[locale];
  const image = firstImage
    ? { url: firstImage, alt: t("Catalog.imageAlt", { name }) }
    : {
        url: new URL("/og-default.png", siteUrl).href,
        width: 1200,
        height: 630,
        alt: t("Product.defaultImageAlt"),
      };

  return {
    title,
    description,
    alternates: { canonical: url, languages: { ...languages, "x-default": languages.ru } },
    openGraph: {
      type: "website", title, description, url, siteName,
      locale: openGraphLocales[locale], images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale, slug } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const detail = await loadProductDetail(slug);
  if (!detail) notFound();

  const { product, currency, colors } = detail;
  const [t, { ProductOptions: optionMessages }] = await Promise.all([getTranslations(), getMessages()]);
  const name = localizedName(product, locale);
  const description = localizedField(product, "description", locale);
  const pairPrice = formatPrice(product.price_per_pair, currency, locale);
  const packPrice = formatPrice(product.price_per_pair * product.pairs_per_pack, currency, locale);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-6">
        <Link
          href={{ pathname: "/catalog", query: { category: product.categories.slug } }}
          className="inline-block rounded py-2 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
        >
          {localizedName(product.categories, locale)}
        </Link>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{name}</h1>
        {description && <p className="mt-3 max-w-3xl whitespace-pre-line text-stone-700">{description}</p>}
      </div>

      <ul className="mb-6 flex flex-wrap gap-x-6 gap-y-2 rounded-xl border border-stone-200 bg-white p-4 text-sm text-stone-700">
        <li>{t("Product.season", { season: t(`Catalog.seasons.${product.season}`) })}</li>
        <li>{t("Catalog.sizes", { range: product.size_range })}</li>
        <li>{t("Catalog.pairsPerPack", { count: product.pairs_per_pack })}</li>
        <li>{t("Product.minPacks", { count: product.min_packs })}</li>
        <li className="font-semibold">{t("Catalog.perPair", { price: pairPrice })}</li>
        <li className="font-semibold">{t("Catalog.perPack", { price: packPrice })}</li>
      </ul>

      <NextIntlClientProvider messages={{ ProductOptions: optionMessages }}>
        <ProductOptions
          key={`${locale}/${product.slug}`}
          productId={product.id}
          name={name}
          colors={colors.map((color) => ({
            id: color.id,
            name: localizedName(color, locale),
            images: color.images,
          }))}
          locale={locale}
          currency={currency}
          pricePerPair={product.price_per_pair}
          pairsPerPack={product.pairs_per_pack}
          minPacks={product.min_packs}
        />
      </NextIntlClientProvider>
    </main>
  );
}
