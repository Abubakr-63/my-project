"use client";

import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";

export default function CheckoutError({ reset }: { reset: () => void }) {
  const t = useTranslations("CartLink");
  return (
    <main className="mx-auto max-w-xl space-y-4 px-4 py-8">
      <p role="alert">{t("error")}</p>
      <button type="button" onClick={reset} className={ui.secondary}>
        {t("retry")}
      </button>
    </main>
  );
}
