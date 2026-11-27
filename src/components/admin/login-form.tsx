"use client";

import { LoginIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
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

  const field = `${ui.input} mt-1 block w-full`;
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
      <button disabled={pending} type="submit" className={ui.primary}>
        <LoginIcon size={18} />{t(pending ? "signingIn" : "signIn")}
      </button>
    </form>
  );
}
