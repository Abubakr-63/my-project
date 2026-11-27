"use client";

import { RefreshIcon } from "@/components/ui/icons";
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
        <h1 className="text-headline-small font-medium">{t("title")}</h1>
        <p className="mt-2 text-on-surface-variant">{t("description")}</p>
        <button
          type="button"
          onClick={() => startTransition(() => { router.refresh(); reset(); })}
          className={`${ui.primary} mt-4`}
        >
          <RefreshIcon size={18} />{t("retry")}
        </button>
      </div>
    </main>
  );
}
