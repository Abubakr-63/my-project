import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { notFound, redirect } from "next/navigation";
import { SignOutForm } from "@/components/admin/admin-nav";
import { LoginForm } from "@/components/admin/login-form";
import { getAdminAccess } from "@/lib/admin/access";
import { routing } from "@/lib/routing";

export default async function AdminLoginPage({ params, searchParams }: PageProps<"/[locale]/admin/login">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const [t, access, query] = await Promise.all([
    getTranslations({ locale, namespace: "Admin" }), getAdminAccess(), searchParams,
  ]);
  const signOutFailed = query.error === "signout";
  if (access.allowed && !signOutFailed) redirect(`/${locale}/admin/orders`);

  return (
    <section className="mx-auto max-w-md space-y-4 rounded-xl border border-stone-200 bg-white p-5">
      <h1 className="text-2xl font-semibold">{t("login")}</h1>
      {signOutFailed && <p role="alert">{t("signOutError")}</p>}
      {access.user ? (
        <>
          {!access.allowed && <p role="alert">{t("noAccess")}</p>}
          <SignOutForm locale={locale} />
        </>
      ) : <LoginForm locale={locale} />}
    </section>
  );
}
