import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { CartLink } from "./cart/cart-link";
import { ThemeToggle } from "./ui/theme-toggle";
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
    <header className="border-b border-outline bg-surface">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link href="/" title={t("Menu.home")} className={`${ui.ghost} text-lg font-semibold`}>
          {t("Site.name")}
        </Link>
        <Link
          href="/catalog"
          className={ui.ghost}
        >
          {t("Menu.catalog")}
        </Link>
        <CartLink />
        <Suspense fallback={
          <div aria-hidden="true" className="invisible flex flex-wrap gap-1">
            {Object.entries(languageNames).map(([code, name]) => <span key={code} className={ui.ghost}>{name}</span>)}
          </div>
        }>
          <LanguageSwitcher locale={locale} label={t("Languages.label")} names={languageNames} />
        </Suspense>
        <ThemeToggle label={t("Theme.label")} labels={{
          system: t("Theme.system"), light: t("Theme.light"), dark: t("Theme.dark"),
        }} />
      </div>
    </header>
  );
}
