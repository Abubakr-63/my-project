import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";

export default async function CatalogNotFound() {
  const t = await getTranslations("CatalogNotFound");

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-stone-600">{t("description")}</p>
      <Link
        href="/catalog"
        className="mt-4 inline-block rounded py-2 underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
      >
        {t("back")}
      </Link>
    </main>
  );
}
