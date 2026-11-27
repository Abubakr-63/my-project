import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { seasons, sortOptions, type CatalogCategory, type CatalogQuery } from "@/lib/catalog";
import { localizedName, type StoreLocale } from "@/lib/catalog-format";

const fieldStyle = `${ui.input} mt-1 w-full text-base`;

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
      className="mb-8 ui-card p-4 sm:p-5"
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
          className={ui.primary}
        >
          {t("apply")}
        </button>
        <Link href="/catalog" className={ui.link}>
          {t("clear")}
        </Link>
      </div>
    </form>
  );
}
