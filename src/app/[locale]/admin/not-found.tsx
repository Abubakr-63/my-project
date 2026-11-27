import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";

export default async function AdminNotFound() {
  const t = await getTranslations("Admin");
  return (
    <div className="space-y-3">
      <h1 className="text-headline-small font-medium">{t("catalogNotFound")}</h1>
      <Link href="/admin/orders" prefetch={false} className={ui.link}>{t("orders")}</Link>
    </div>
  );
}
