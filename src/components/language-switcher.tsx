"use client";

import { useSearchParams } from "next/navigation";
import { locales, routeLocales, type StoreLocale } from "@/lib/locales";
import { Link, usePathname } from "@/lib/navigation";

export function LanguageSwitcher({ locale, label, names }: {
  locale: StoreLocale;
  label: string;
  names: Record<StoreLocale, string>;
}) {
  const pathname = usePathname();
  const query = useSearchParams().toString();
  const href = query ? `${pathname}?${query}` : pathname;

  return (
    <nav aria-label={label} className="ui-segments">
      {routeLocales.map((option) => (
        <Link
          key={option}
          href={href}
          locale={option}
          prefetch={false}
          lang={locales[option].htmlLang}
          aria-label={names[option]}
          hrefLang={locales[option].hreflang}
          aria-current={locale === option ? "page" : undefined}
          className="ui-segment"
        >
          {option.toUpperCase()}
        </Link>
      ))}
    </nav>
  );
}
