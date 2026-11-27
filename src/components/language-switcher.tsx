"use client";

import { useSearchParams } from "next/navigation";
import { locales, routeLocales, type StoreLocale } from "@/lib/locales";
import { ui } from "./ui/styles";
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
    <nav aria-label={label} className="flex flex-wrap gap-1">
      {routeLocales.map((option) => (
        <Link
          key={option}
          href={href}
          locale={option}
          prefetch={false}
          lang={locales[option].htmlLang}
          hrefLang={locales[option].hreflang}
          aria-current={locale === option ? "page" : undefined}
          className={`${ui.ghost} aria-[current=page]:bg-subtle aria-[current=page]:font-semibold`}
        >
          {names[option]}
        </Link>
      ))}
    </nav>
  );
}
