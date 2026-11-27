"use client";

import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function CartError({ reset }: { reset: () => void }) {
  const t = useTranslations("CartLink");
  const router = useRouter();

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 role="alert" className="text-2xl font-semibold">{t("error")}</h1>
      <button type="button" className={ui.secondary}
        onClick={() => startTransition(() => { router.refresh(); reset(); })}>{t("retry")}</button>
    </main>
  );
}
