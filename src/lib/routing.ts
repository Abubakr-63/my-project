import { defineRouting } from "next-intl/routing";
import { defaultRouteLocale, routeLocales } from "./locales";

export const routing = defineRouting({
  locales: routeLocales,
  defaultLocale: defaultRouteLocale,
  localePrefix: "always",
  localeDetection: false,
});
