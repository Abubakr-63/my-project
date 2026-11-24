import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { catalogSearch, type CatalogQuery } from "@/lib/catalog";

const linkStyle = "rounded-md border border-stone-300 bg-white px-3 py-2.5 text-sm hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700";

export async function CatalogPagination({ filters, pages }: { filters: CatalogQuery; pages: number }) {
  if (pages < 2) return null;

  const t = await getTranslations("Catalog");
  const { page } = filters;

  return (
    <nav aria-label={t("pagination")} className="mt-8 flex flex-wrap items-center justify-center gap-3">
      {page > 1 && (
        <Link href={{ pathname: "/catalog", query: catalogSearch(filters, page - 1) }} className={linkStyle}>
          {t("previous")}
        </Link>
      )}
      <span className="text-sm text-stone-700">{t("pageNumber", { page, pages })}</span>
      {page < pages && (
        <Link href={{ pathname: "/catalog", query: catalogSearch(filters, page + 1) }} className={linkStyle}>
          {t("next")}
        </Link>
      )}
    </nav>
  );
}
