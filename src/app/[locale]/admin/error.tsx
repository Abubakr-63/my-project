"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function AdminError({ reset }: { reset: () => void }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  return (
    <div className="space-y-3">
      <p role="alert">{t("loadError")}</p>
      <button type="button" className="min-h-11 rounded-md border px-4 focus-visible:outline-2"
        onClick={() => startTransition(() => { router.refresh(); reset(); })}>{t("retry")}</button>
    </div>
  );
}
