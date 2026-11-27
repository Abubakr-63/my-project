import { EditIcon } from "@/components/ui/icons";
import { AddIcon, FilterIcon } from "@/components/ui/icons";
import { PagerLink } from "@/components/ui/pager-link";
import { ui } from "@/components/ui/styles";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/admin/admin-nav";
import { CatalogForm } from "@/components/admin/catalog-form";
import { requireAdmin } from "@/lib/admin/access";
import { productFilters } from "@/lib/admin/validation";
import { loadCatalogCurrency } from "@/lib/catalog";
import { formatPrice, localizedName } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";
import { routing } from "@/lib/routing";
import { deleteProduct } from "../catalog-actions";
import { setProductActive } from "../manage-actions";

const PAGE_SIZE = 20;
const control = ui.secondary;

export default async function ProductsPage({ params, searchParams }: PageProps<"/[locale]/admin/products">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const { supabase } = await requireAdmin(locale);
  const filters = productFilters(await searchParams);
  const offset = (filters.page - 1) * PAGE_SIZE;
  let query = supabase.from("products")
    .select("id,slug,name_ru,name_tg,name_en,is_active,price_per_pair", { count: "exact" })
    .order("created_at", { ascending: false }).order("id");
  if (filters.category) query = query.eq("category_id", filters.category);
  if (filters.status !== "all") query = query.eq("is_active", filters.status === "active");
  if (filters.q) {
    const match = `*${filters.q}*`;
    query = query.or(`slug.ilike.${match},name_ru.ilike.${match},name_tg.ilike.${match},name_en.ilike.${match}`);
  }
  const [t, currency, result, categories] = await Promise.all([
    getTranslations("Admin"), loadCatalogCurrency(supabase), query.range(offset, offset + PAGE_SIZE - 1),
    supabase.from("categories").select("id,name_ru,name_tg,name_en").order("sort_order").order("id"),
  ]);
  if (categories.error) throw new Error("Categories unavailable");
  if (result.error && result.error.code !== "PGRST103") throw new Error("Products unavailable");
  const products = result.data ?? [];
  const pages = Math.max(1, Math.ceil((result.count ?? 0) / PAGE_SIZE));
  const pageHref = (page: number) => ({
    pathname: "/admin/products", query: { page, q: filters.q, active: filters.status, category: filters.category },
  });

  return (
    <>
      <AdminNav locale={locale} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-headline-large font-medium">{t("products")}</h1>
        <Link href="/admin/products/new" prefetch={false} className={`inline-flex items-center ${control}`}><AddIcon size={18} />{t("newProduct")}</Link>
      </div>
      <form method="get" action={`/${locale}/admin/products`} className="flex flex-wrap items-end gap-3">
        <label className="flex min-w-0 flex-1 basis-56 flex-col gap-1">{t("productSearch")}
          <input type="search" name="q" maxLength={80} defaultValue={filters.q} className={ui.input} />
        </label>
        <label className="flex flex-col gap-1">{t("status")}
          <select name="active" defaultValue={filters.status} className={ui.select}>
            <option value="all">{t("all")}</option>
            <option value="active">{t("active")}</option>
            <option value="inactive">{t("inactive")}</option>
          </select>
        </label>
        <label className="flex min-w-0 flex-col gap-1">{t("categories")}
          <select name="category" defaultValue={filters.category} className={ui.select}>
            <option value="">{t("allCategories")}</option>
            {categories.data.map((category) => <option key={category.id} value={category.id}>{localizedName(category, locale)}</option>)}
          </select>
        </label>
        <button type="submit" className={control}><FilterIcon size={18} />{t("apply")}</button>
      </form>
      {!products.length && <p>{t("noProducts")}</p>}
      <ul className="space-y-2">
        {products.map((product) => (
          <li key={product.id} className="flex flex-wrap items-start justify-between gap-3 ui-card p-4">
            <div>
              <Link prefetch={false} href={`/admin/products/${product.id}`} className={ui.link}>
                <EditIcon size={18} />{localizedName(product, locale)}
              </Link>
              <p className="text-sm text-on-surface-variant">{formatPrice(product.price_per_pair, currency, locale)}</p>
              <p className="text-sm text-on-surface-variant">{t(product.is_active ? "active" : "inactive")}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <CatalogForm action={setProductActive.bind(null, product.id, !product.is_active)}
                label={product.is_active ? "deactivate" : "activate"} />
              <CatalogForm action={deleteProduct.bind(null, product.id)} label="delete" confirm />
            </div>
          </li>
        ))}
      </ul>
      {(pages > 1 || filters.page > 1) && (
        <nav aria-label={t("catalogPages")} className="flex flex-wrap items-center gap-3">
          {filters.page > 1 && (
            <PagerLink direction="previous" prefetch={false} href={pageHref(filters.page > pages ? 1 : filters.page - 1)}>
              {t("previous")}
            </PagerLink>
          )}
          {filters.page <= pages && <span>{t("page", { page: filters.page, pages })}</span>}
          {filters.page < pages && (
            <PagerLink direction="next" prefetch={false} href={pageHref(filters.page + 1)}>
              {t("next")}
            </PagerLink>
          )}
        </nav>
      )}
    </>
  );
}
