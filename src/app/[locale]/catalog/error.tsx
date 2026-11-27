"use client";

import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function CatalogError({ reset }: { reset: () => void }) {
  const t = useTranslations("CatalogError");
  const router = useRouter();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div role="alert" className="ui-card p-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-muted">{t("description")}</p>
        <button
          type="button"
          onClick={() => startTransition(() => { router.refresh(); reset(); })}
          className={`${ui.primary} mt-4`}
        >
          {t("retry")}
        </button>
      </div>
    </main>
  );
}
