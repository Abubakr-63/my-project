import { getTranslations } from "next-intl/server";
import { CartLink } from "./cart/cart-link";
import { HeaderControls } from "./ui/header-controls";
import { HeaderLink } from "./ui/header-link";
import { InventoryIcon, StoreIcon } from "./ui/icons";
import type { StoreLocale } from "@/lib/locales";

export async function Header({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale });
  return (
    <header className="floating-header header-bar public-header">
      <HeaderLink href="/" aria-label={t("Menu.home")}>
        <StoreIcon /><span className="hidden sm:inline">{t("Site.name")}</span>
      </HeaderLink>
      <HeaderLink href="/catalog" aria-label={t("Menu.catalog")}>
        <InventoryIcon /><span className="hidden sm:inline">{t("Menu.catalog")}</span>
      </HeaderLink>
      <CartLink />
      <span className="flex-1" />
      <HeaderControls locale={locale} />
    </header>
  );
}
