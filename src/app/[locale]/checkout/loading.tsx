import { LoadingSkeleton } from "@/components/ui/loading-skeleton";
import { getTranslations } from "next-intl/server";

export default async function CheckoutLoading() {
  const t = await getTranslations("Checkout");
  return <div className="mx-auto max-w-xl px-4 py-8"><LoadingSkeleton label={t("loading")} rows={2} /></div>;
}
