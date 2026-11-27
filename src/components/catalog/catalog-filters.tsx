import { CatalogFilterForm } from "./catalog-filter-form";
import { FilterIcon, RestartIcon, SearchIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { maxProductSearchLength } from "@/lib/product-search";
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

  const count = [
    Boolean(filters.category), Boolean(filters.season), filters.minPrice !== undefined,
    filters.maxPrice !== undefined, filters.sort !== "newest",
  ].filter(Boolean).length;

  return (
    <CatalogFilterForm action={`/${locale}/catalog`} label={t("filters")}>
      <div className="relative me-[8.25rem]">
        <button type="submit" aria-label={t("search")}
          className={`${ui.ghost} absolute start-0 top-0 px-0`}>
          <SearchIcon size={18} />
        </button>
        <input name="q" type="search" enterKeyHint="search" aria-label={t("search")}
          placeholder={t("search")} defaultValue={filters.q} maxLength={maxProductSearchLength}
          className={`${ui.input} w-full ps-11`} />
      </div>
      <details open={count > 0}>
        <summary className={`${ui.secondary} absolute end-0 top-0 w-[7.75rem] cursor-pointer list-none gap-1 px-2 [&::-webkit-details-marker]:hidden`}>
          <FilterIcon size={18} />{t("filterButton")}
          {count > 0 && <span className="rounded-m3-full bg-primary px-1.5 text-label-small text-on-primary">{count}</span>}
        </summary>
        <div className="ui-card mt-3 p-3 sm:p-5">
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
          <div className="mt-4 flex items-center gap-1 sm:gap-3">
            <button
              type="submit"
              className={ui.primary}
            >
              <FilterIcon size={18} />{t("applyShort")}
            </button>
            <Link href="/catalog" className={ui.link}>
              <RestartIcon size={18} />{t("reset")}
            </Link>
          </div>
        </div>
      </details>
    </CatalogFilterForm>
  );
}
