import { getTranslations } from "next-intl/server";

export default async function CatalogLoading() {
  const t = await getTranslations("Catalog");

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-6 text-headline-large font-medium tracking-tight sm:text-4xl">{t("title")}</h1>
      <p role="status" className="sr-only">{t("loading")}</p>
      <div aria-hidden="true">
        <div className="mb-8 h-32 rounded-m3-lg ui-skeleton" />
        <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, index) => (
            <div key={index} className="overflow-hidden rounded-m3-lg bg-surface">
              <div className="aspect-square ui-skeleton" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded-m3-xs ui-skeleton" />
                <div className="h-3 w-1/2 rounded-m3-xs ui-skeleton" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
