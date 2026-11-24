import { getTranslations } from "next-intl/server";
import { CartLink } from "./cart/cart-link";
import { LanguageSwitcher } from "./language-switcher";
import { Link } from "@/lib/navigation";
import { routing } from "@/lib/routing";

export async function Header({ locale }: { locale: (typeof routing.locales)[number] }) {
  const t = await getTranslations();

  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-5 py-3">
        <Link href="/" title={t("Menu.home")} className="py-2 text-lg font-semibold">
          {t("Site.name")}
        </Link>
        <Link
          href="/catalog"
          className="rounded px-3 py-2 text-sm font-medium hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
        >
          {t("Menu.catalog")}
        </Link>
        <CartLink />
        <LanguageSwitcher locale={locale} />
      </div>
    </header>
  );
}
