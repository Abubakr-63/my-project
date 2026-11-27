import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CartLink } from "./cart/cart-link";
import { ThemeToggle } from "./ui/theme-toggle";
import { InventoryIcon, StoreIcon } from "./ui/icons";
import { ui } from "./ui/styles";
import { LanguageSwitcher } from "./language-switcher";
import { Link } from "@/lib/navigation";
import { locales, type StoreLocale } from "@/lib/locales";

export async function Header({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations();
  const languageNames = {
    ru: t(`Languages.${locales.ru.htmlLang}`),
    tj: t(`Languages.${locales.tj.htmlLang}`),
    en: t(`Languages.${locales.en.htmlLang}`),
  };

  return (
    <header className="floating-header">
      <div className="flex flex-wrap items-center justify-between gap-x-1 gap-y-1 p-2 sm:px-3">
        <Link href="/" title={t("Menu.home")} className={`${ui.ghost} min-w-0 flex-1 justify-start gap-2 text-title-medium font-semibold sm:flex-none`}>
          <StoreIcon className="shrink-0 text-primary" /><span className="truncate">{t("Site.name")}</span>
        </Link>
        <Link
          href="/catalog"
          className={`${ui.ghost} gap-2 px-2 sm:px-3`} aria-label={t("Menu.catalog")}
        >
          <InventoryIcon /><span className="hidden sm:inline">{t("Menu.catalog")}</span>
        </Link>
        <CartLink />
        <div className="flex w-full items-center justify-between gap-1 sm:w-auto">
        <Suspense fallback={
          <div aria-hidden="true" className="ui-segments invisible">
            {Object.keys(languageNames).map((code) => <span key={code} className="ui-segment">{code.toUpperCase()}</span>)}
          </div>
        }>
          <LanguageSwitcher locale={locale} label={t("Languages.label")} names={languageNames} />
        </Suspense>
        <ThemeToggle label={t("Theme.label")} labels={{
          system: t("Theme.system"), light: t("Theme.light"), dark: t("Theme.dark"),
        }} />
        </div>
      </div>
    </header>
  );
}
