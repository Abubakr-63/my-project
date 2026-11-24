"use client";

import { useTranslations } from "next-intl";

export default function CheckoutError({ reset }: { reset: () => void }) {
  const t = useTranslations("CartLink");
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <p role="alert">{t("error")}</p>
      <button type="button" onClick={reset} className="min-h-11 rounded-md border px-4 focus-visible:outline-2">
        {t("retry")}
      </button>
    </main>
  );
}
