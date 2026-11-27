import { ui } from "@/components/ui/styles";
import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/[locale]/admin/actions";
import type { StoreLocale } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";

export async function SignOutForm({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <form action={signOut.bind(null, locale)}>
      <button type="submit" className={ui.secondary}>
        {t("signOut")}
      </button>
    </form>
  );
}

export async function AdminNav({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <nav aria-label={t("navigation")} className="flex flex-wrap items-center justify-between gap-2 border-b border-outline pb-3">
      <div className="flex flex-wrap gap-1">
        {(["orders", "products", "categories", "settings"] as const).map((section) => (
          <Link key={section} href={`/admin/${section}`} prefetch={false}
            className={ui.link}>
            {t(section)}
          </Link>
        ))}
      </div>
      <SignOutForm locale={locale} />
    </nav>
  );
}
