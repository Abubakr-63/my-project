import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getTranslations } from "next-intl/server";

export default async function AdminLoading() {
  const t = await getTranslations("Admin");
  return <LoadingSkeleton label={t("loading")} />;
}
