import { getTranslations } from "next-intl/server";
import { Link } from "@/lib/navigation";
import { routing } from "@/lib/routing";

export async function LanguageSwitcher({
  locale,
}: {
  locale: (typeof routing.locales)[number];
}) {
  const t = await getTranslations("Languages");

  return (
    <nav aria-label={t("label")} className="flex flex-wrap gap-1">
      {routing.locales.map((option) => (
        <Link
          key={option}
          href="/"
          locale={option}
          lang={option}
          hrefLang={option}
          aria-current={locale === option ? "page" : undefined}
          className="rounded-md px-3 py-3 text-sm hover:bg-stone-100 aria-[current=page]:bg-stone-200 aria-[current=page]:font-semibold"
        >
          {t(option)}
        </Link>
      ))}
    </nav>
  );
}
