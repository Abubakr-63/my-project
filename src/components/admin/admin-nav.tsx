import { CategoryIcon, InventoryIcon, LogoutIcon, ReceiptIcon, SettingsIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/[locale]/admin/actions";
import type { StoreLocale } from "@/lib/catalog-format";
import { HeaderLink } from "@/components/ui/header-link";
import { HeaderControls } from "@/components/ui/header-controls";

export async function SignOutForm({ locale, compact = false }: { locale: StoreLocale; compact?: boolean }) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <form action={signOut.bind(null, locale)}>
      <button type="submit" aria-label={t("signOut")} className={compact ? `${ui.ghost} header-item` : ui.secondary}>
        <LogoutIcon size={18} /><span className={compact ? "hidden sm:inline" : undefined}>{t("signOut")}</span>
      </button>
    </form>
  );
}

const sections = { orders: ReceiptIcon, products: InventoryIcon, categories: CategoryIcon, settings: SettingsIcon } as const;

export async function AdminNav({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <nav aria-label={t("navigation")} className="header-bar admin-header rounded-m3-full bg-surface-container-high">
      <div className="admin-header-links">
        {Object.entries(sections).map(([section, Icon]) => (
          <HeaderLink key={section} href={`/admin/${section}`} prefetch={false} aria-label={t(section)}>
            <Icon size={18} /><span className="hidden sm:inline">{t(section)}</span>
          </HeaderLink>
        ))}
        <SignOutForm locale={locale} compact />
      </div>
      <HeaderControls locale={locale} />
    </nav>
  );
}
