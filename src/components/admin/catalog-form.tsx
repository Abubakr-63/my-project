"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { startTransition, useActionState, type ReactNode } from "react";
import type { CatalogResult } from "@/lib/admin/catalog-mutations";

export function CatalogForm({ action, children, label = "saveCatalog", confirm = false }: {
  action: (form: FormData) => Promise<CatalogResult>;
  children?: ReactNode;
  label?: "saveCatalog" | "delete" | "activate" | "deactivate";
  confirm?: boolean;
}) {
  const t = useTranslations("Admin");
  const router = useRouter();
  const [result, submit, pending] = useActionState(async (_previous: CatalogResult | null, form: FormData) => {
    const next = await action(form);
    if (next.ok) router.refresh();
    return next;
  }, null);

  return (
    <form action={submit} aria-busy={pending} className="space-y-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (pending || (confirm && !window.confirm(t("confirmDelete")))) return;
        const fields = new FormData(event.currentTarget);
        startTransition(() => submit(fields));
      }}>
      {children}
      <button type="submit" disabled={pending}
        className="min-h-11 rounded-md border border-stone-300 bg-white px-4 hover:bg-stone-100 focus-visible:outline-2 disabled:opacity-50">
        {t(pending ? "saving" : label)}
      </button>
      <p role="status" className="text-sm">{!pending && result?.ok && t("catalogSaved")}</p>
      {!pending && result && !result.ok && <p role="alert" className="text-sm text-red-800">{t(result.error)}</p>}
    </form>
  );
}
