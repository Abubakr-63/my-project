"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function CatalogError({ reset }: { reset: () => void }) {
  const t = useTranslations("CatalogError");
  const router = useRouter();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <div role="alert" className="rounded-xl border border-stone-200 bg-white p-6">
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="mt-2 text-stone-600">{t("description")}</p>
        <button
          type="button"
          onClick={() => startTransition(() => { router.refresh(); reset(); })}
          className="mt-4 cursor-pointer rounded-md bg-stone-900 px-4 py-2.5 text-sm text-white hover:bg-stone-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-700"
        >
          {t("retry")}
        </button>
      </div>
    </main>
  );
}
