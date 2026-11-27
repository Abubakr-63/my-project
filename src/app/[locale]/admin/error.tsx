"use client";

import { ui } from "@/components/ui/styles";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition } from "react";

export default function AdminError({ reset }: { reset: () => void }) {
  const t = useTranslations("Admin");
  const router = useRouter();
  return (
    <div className="space-y-3">
      <p role="alert">{t("loadError")}</p>
      <button type="button" className={ui.secondary}
        onClick={() => startTransition(() => { router.refresh(); reset(); })}>{t("retry")}</button>
    </div>
  );
}
