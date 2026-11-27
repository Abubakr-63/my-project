import { CatalogGridSkeleton } from "@/components/catalog/catalog-grid-skeleton";
import { getTranslations } from "next-intl/server";

export default async function CatalogLoading() {
  const t = await getTranslations("Catalog");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-headline-large font-medium tracking-tight sm:text-4xl">{t("title")}</h1>
      <CatalogGridSkeleton label={t("loading")} />
    </main>
  );
}
