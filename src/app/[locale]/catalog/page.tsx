import { Suspense } from "react";
import { headers } from "next/headers";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogGridSkeleton } from "@/components/catalog/catalog-grid-skeleton";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { ui } from "@/components/ui/styles";
import { catalogSearch, loadCatalogOptions, loadCatalogProducts, pageSize, readCatalogQuery, type CatalogQuery } from "@/lib/catalog";
import { type StoreLocale } from "@/lib/locales";
import { Link } from "@/lib/navigation";
import { routing } from "@/lib/routing";

async function CatalogResults({ filters, categoryId, locale, currency }: {
  filters: CatalogQuery;
  categoryId?: string;
  locale: StoreLocale;
  currency: string;
}) {
  const [t, { products, total }] = await Promise.all([
    getTranslations({ locale, namespace: "Catalog" }),
    loadCatalogProducts(filters, categoryId),
  ]);
  const pages = Math.ceil(total / pageSize);
  if (filters.page > Math.max(1, pages)) {
    const search = new URLSearchParams(catalogSearch(filters, 1)).toString();
    redirect(`/${locale}/catalog${search ? `?${search}` : ""}`);
  }

  return (
    <>
      {products.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}><ProductCard product={product} currency={currency} locale={locale} /></li>
          ))}
        </ul>
      ) : (
        <div className="ui-card px-5 py-12 text-center">
          <h2 className="text-lg font-semibold">{filters.q ? t("emptySearch", { query: filters.q }) : t("emptyTitle")}</h2>
          <p className="mt-2 text-sm text-on-surface-variant">{t("emptyDescription")}</p>
          <Link href="/catalog" className={ui.link}>{t("reset")}</Link>
        </div>
      )}
      <CatalogPagination filters={filters} pages={pages} />
    </>
  );
}

export default async function CatalogPage({ params, searchParams }: PageProps<"/[locale]/catalog">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const [t, { categories, currency }, requestHeaders, rawQuery] = await Promise.all([
    getTranslations("Catalog"), loadCatalogOptions(), headers(), searchParams,
  ]);
  const query = readCatalogQuery(rawQuery);
  const category = categories.find(({ slug }) => slug === query.category);
  const filters = { ...query, category: category?.slug };
  const queryKey = new URLSearchParams(catalogSearch(filters, filters.page)).toString();
  const results = <CatalogResults filters={filters} categoryId={category?.id} locale={locale} currency={currency} />;
  // A document response must contain visible results without React's stream reveal script.
  const isClientNavigation = requestHeaders.get("rsc") === "1" || requestHeaders.get("sec-fetch-dest") === "empty";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-headline-large font-medium tracking-tight sm:text-4xl">{t("title")}</h1>
      <CatalogFilters key={queryKey} categories={categories} filters={filters} locale={locale} currency={currency} />
      {isClientNavigation ? (
        <Suspense key={queryKey} fallback={<CatalogGridSkeleton label={t("loading")} />}>{results}</Suspense>
      ) : results}
    </main>
  );
}
