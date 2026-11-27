import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";

export default async function OrderNotFound() {
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{t("notFound")}</h1>
      <Link href="/admin/orders" prefetch={false} className={ui.link}>{t("orders")}</Link>
    </div>
  );
}
