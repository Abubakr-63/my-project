import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { LanguageSwitcher } from "@/components/language-switcher";
import { locales, routeLocales, type StoreLocale } from "@/lib/locales";
import { ThemeToggle } from "./theme-toggle";

export async function HeaderControls({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale });
  const names = {
    ru: t(`Languages.${locales.ru.htmlLang}`),
    tj: t(`Languages.${locales.tj.htmlLang}`),
    en: t(`Languages.${locales.en.htmlLang}`),
  };

  return (
    <>
      <span className="header-divider" aria-hidden="true" />
      <Suspense fallback={
        <div className="ui-segments" aria-hidden="true">
          {routeLocales.map((code) => (
            <span key={code} className="ui-segment" aria-current={code === locale ? "page" : undefined}>
              {code.toUpperCase()}
            </span>
          ))}
        </div>
      }>
        <LanguageSwitcher locale={locale} label={t("Languages.label")} names={names} />
      </Suspense>
      <ThemeToggle label={t("Theme.label")} labels={{
        system: t("Theme.system"), light: t("Theme.light"), dark: t("Theme.dark"),
      }} />
    </>
  );
}
