import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";

export default async function AdminNotFound() {
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{t("catalogNotFound")}</h1>
      <Link href="/admin/orders" prefetch={false} className="inline-flex min-h-11 items-center underline focus-visible:outline-2">{t("orders")}</Link>
    </div>
  );
}
