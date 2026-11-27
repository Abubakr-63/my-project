import { CategoryIcon, InventoryIcon, LogoutIcon, ReceiptIcon, SettingsIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/[locale]/admin/actions";
import type { StoreLocale } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";

export async function SignOutForm({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <form action={signOut.bind(null, locale)}>
      <button type="submit" className={ui.secondary}>
        <LogoutIcon size={18} />{t("signOut")}
      </button>
    </form>
  );
}

const sections = { orders: ReceiptIcon, products: InventoryIcon, categories: CategoryIcon, settings: SettingsIcon } as const;

export async function AdminNav({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <nav aria-label={t("navigation")} className="flex flex-wrap items-center justify-between gap-1 rounded-m3-xl bg-surface-container-high p-2">
      <div className="flex flex-wrap gap-1">
        {Object.entries(sections).map(([section, Icon]) => (
          <Link key={section} href={`/admin/${section}`} prefetch={false}
            className={ui.ghost}>
            <Icon size={18} />{t(section)}
          </Link>
        ))}
      </div>
      <SignOutForm locale={locale} />
    </nav>
  );
}
