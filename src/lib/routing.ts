import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "tg", "en"],
  defaultLocale: "ru",
  localePrefix: "always",
  localeDetection: false,
});
