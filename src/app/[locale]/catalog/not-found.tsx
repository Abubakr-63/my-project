import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";

export default async function CatalogNotFound() {
  const t = await getTranslations("CatalogNotFound");

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-semibold">{t("title")}</h1>
      <p className="mt-2 text-muted">{t("description")}</p>
      <Link
        href="/catalog"
        className={`${ui.link} mt-4`}
      >
        {t("back")}
      </Link>
    </main>
  );
}
