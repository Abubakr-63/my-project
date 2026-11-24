"use client";

import { useTranslations } from "next-intl";
import { useActionState } from "react";
import { signIn } from "@/app/[locale]/admin/actions";
import type { StoreLocale } from "@/lib/catalog-format";

export function LoginForm({ locale }: { locale: StoreLocale }) {
  const t = useTranslations("Admin");
  const [result, action, pending] = useActionState(
    async (_previous: Awaited<ReturnType<typeof signIn>> | null, form: FormData) => signIn(locale, form),
    null,
  );

  const field = "mt-1 block min-h-11 w-full rounded-md border border-stone-300 px-3 focus-visible:outline-2";
  const errorId = result ? "admin-login-error" : undefined;
  return (
    <form action={action} aria-busy={pending} className="space-y-4">
      <label className="block">{t("email")}
        <input name="email" type="email" autoComplete="username" maxLength={254} required
          className={field} aria-invalid={!!result} aria-describedby={errorId} />
      </label>
      <label className="block">{t("password")}
        <input name="password" type="password" autoComplete="current-password" maxLength={1024} required
          className={field} aria-invalid={!!result} aria-describedby={errorId} />
      </label>
      <p id="admin-login-error" role="alert">{result && t("credentials")}</p>
      <button disabled={pending} type="submit" className="min-h-11 rounded-md bg-stone-900 px-4 text-white focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-50">
        {t(pending ? "signingIn" : "signIn")}
      </button>
    </form>
  );
}
