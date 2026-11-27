import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { CatalogFilters } from "@/components/catalog/catalog-filters";
import { CatalogPagination } from "@/components/catalog/catalog-pagination";
import { ProductCard } from "@/components/catalog/product-card";
import { catalogSearch, loadCatalog, pageSize, readCatalogQuery } from "@/lib/catalog";
import { routing } from "@/lib/routing";

export default async function CatalogPage({ params, searchParams }: PageProps<"/[locale]/catalog">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const query = readCatalogQuery(await searchParams);
  const [t, { categories, currency, filters, products, total }] = await Promise.all([
    getTranslations("Catalog"),
    loadCatalog(query),
  ]);
  const pages = Math.ceil(total / pageSize);

  if (filters.page > Math.max(1, pages)) {
    const search = new URLSearchParams(catalogSearch(filters, 1)).toString();
    redirect(`/${locale}/catalog${search ? `?${search}` : ""}`);
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-3xl font-semibold tracking-tight sm:text-4xl">{t("title")}</h1>
      <CatalogFilters categories={categories} filters={filters} locale={locale} currency={currency} />
      {products.length ? (
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductCard product={product} currency={currency} locale={locale} />
            </li>
          ))}
        </ul>
      ) : (
        <div className="ui-card px-5 py-12 text-center">
          <h2 className="text-lg font-semibold">{t("emptyTitle")}</h2>
          <p className="mt-2 text-sm text-muted">{t("emptyDescription")}</p>
        </div>
      )}
      <CatalogPagination filters={filters} pages={pages} />
    </main>
  );
}
