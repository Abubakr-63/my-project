export const locales = {
  ru: { routeLocale: "ru", htmlLang: "ru", hreflang: "ru", ogLocale: "ru_RU", intlLocale: "ru", dbLocale: "ru" },
  tj: { routeLocale: "tj", htmlLang: "tg", hreflang: "tg", ogLocale: "tg_TJ", intlLocale: "tg", dbLocale: "tg" },
  en: { routeLocale: "en", htmlLang: "en", hreflang: "en", ogLocale: "en_US", intlLocale: "en", dbLocale: "en" },
} as const;

export const routeLocales = [locales.ru.routeLocale, locales.tj.routeLocale, locales.en.routeLocale] as const;
export const defaultRouteLocale = locales.ru.routeLocale;
export type StoreLocale = (typeof routeLocales)[number];
export type DatabaseLocale = (typeof locales)[StoreLocale]["dbLocale"];
