import { hasLocale } from "next-intl";
import { getRequestConfig } from "next-intl/server";
import { locales } from "./locales";
import { routing } from "./routing";

const loadMessages = {
  ru: () => import("@/messages/ru.json"),
  tg: () => import("@/messages/tg.json"),
  en: () => import("@/messages/en.json"),
};

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = hasLocale(routing.locales, requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;

  return { locale, messages: (await loadMessages[locales[locale].dbLocale]()).default };
});
