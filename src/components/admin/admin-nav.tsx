import { getTranslations } from "next-intl/server";
import { signOut } from "@/app/[locale]/admin/actions";
import type { StoreLocale } from "@/lib/catalog-format";
import { Link } from "@/lib/navigation";

export async function SignOutForm({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <form action={signOut.bind(null, locale)}>
      <button type="submit" className="min-h-11 rounded-md border border-stone-300 px-4 focus-visible:outline-2">
        {t("signOut")}
      </button>
    </form>
  );
}

export async function AdminNav({ locale }: { locale: StoreLocale }) {
  const t = await getTranslations({ locale, namespace: "Admin" });
  return (
    <nav aria-label={t("navigation")} className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 pb-3">
      <Link href="/admin/orders" prefetch={false} className="inline-flex min-h-11 items-center rounded px-2 font-semibold underline underline-offset-4 focus-visible:outline-2">
        {t("orders")}
      </Link>
      <SignOutForm locale={locale} />
    </nav>
  );
}
