import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getTranslations } from "next-intl/server";

export default async function CartLoading() {
  const t = await getTranslations("Cart");
  return <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
    <h1 className="text-3xl font-semibold">{t("title")}</h1>
    <LoadingSkeleton label={t("loading")} />
  </main>;
}
