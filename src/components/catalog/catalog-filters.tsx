import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { seasons, sortOptions, type CatalogCategory, type CatalogQuery } from "@/lib/catalog";
import { localizedName, type StoreLocale } from "@/lib/catalog-format";

const fieldStyle = "mt-1 w-full min-w-0 rounded-md border border-stone-300 bg-white px-2 py-2 text-base text-stone-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700";

export async function CatalogFilters({
  categories, filters, locale, currency,
}: {
  categories: CatalogCategory[];
  filters: CatalogQuery;
  locale: StoreLocale;
  currency: string;
}) {
  const t = await getTranslations("Catalog");

  return (
    <form
      method="get"
      action={`/${locale}/catalog`}
      aria-label={t("filters")}
      className="mb-8 rounded-xl border border-stone-200 bg-white p-4 sm:p-5"
    >
      <div className="grid grid-cols-2 gap-4 text-sm font-medium lg:grid-cols-5">
        <label>
          {t("category")}
          <select name="category" defaultValue={filters.category ?? ""} className={fieldStyle}>
            <option value="">{t("anyCategory")}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>{localizedName(category, locale)}</option>
            ))}
          </select>
        </label>
        <label>
          {t("season")}
          <select name="season" defaultValue={filters.season ?? ""} className={fieldStyle}>
            <option value="">{t("anySeason")}</option>
            {seasons.map((season) => (
              <option key={season} value={season}>{t(`seasons.${season}`)}</option>
            ))}
          </select>
        </label>
        <label>
          {t("minPrice", { currency })}
          <input
            type="number" inputMode="decimal" name="minPrice" min={0} max={9999999999.99} step="0.01"
            defaultValue={filters.minPrice} className={fieldStyle}
          />
        </label>
        <label>
          {t("maxPrice", { currency })}
          <input
            type="number" inputMode="decimal" name="maxPrice" min={0} max={9999999999.99} step="0.01"
            defaultValue={filters.maxPrice} className={fieldStyle}
          />
        </label>
        <label className="col-span-2 sm:col-span-1">
          {t("sort")}
          <select name="sort" defaultValue={filters.sort} className={fieldStyle}>
            {sortOptions.map((sort) => (
              <option key={sort} value={sort}>{t(`sortOptions.${sort}`)}</option>
            ))}
          </select>
        </label>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="cursor-pointer rounded-md bg-stone-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
        >
          {t("apply")}
        </button>
        <Link href="/catalog" className="rounded-md px-3 py-2.5 text-sm underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700">
          {t("clear")}
        </Link>
      </div>
    </form>
  );
}
