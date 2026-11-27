import { PagerLink } from "@/components/ui/pager-link";
import { getTranslations } from "next-intl/server";
import { catalogSearch, type CatalogQuery } from "@/lib/catalog";

export async function CatalogPagination({ filters, pages }: { filters: CatalogQuery; pages: number }) {
  if (pages < 2) return null;

  const t = await getTranslations("Catalog");
  const { page } = filters;

  return (
    <nav aria-label={t("pagination")} className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {page > 1 && (
        <PagerLink direction="previous" href={{ pathname: "/catalog", query: catalogSearch(filters, page - 1) }}>
          {t("previous")}
        </PagerLink>
      )}
      <span className="text-sm text-on-surface-variant">{t("pageNumber", { page, pages })}</span>
      {page < pages && (
        <PagerLink direction="next" href={{ pathname: "/catalog", query: catalogSearch(filters, page + 1) }}>
          {t("next")}
        </PagerLink>
      )}
    </nav>
  );
}
