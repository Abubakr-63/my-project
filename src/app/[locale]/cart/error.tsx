"use client";

import { RefreshIcon } from "@/components/ui/icons";
import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function CartError({ reset }: { reset: () => void }) {
  const t = useTranslations("CartLink");
  const router = useRouter();

  return (
    <main className="mx-auto max-w-3xl space-y-4 px-4 py-8">
      <h1 role="alert" className="text-headline-small font-medium">{t("error")}</h1>
      <button type="button" className={ui.secondary}
        onClick={() => startTransition(() => { router.refresh(); reset(); })}><RefreshIcon size={18} />{t("retry")}</button>
    </main>
  );
}
