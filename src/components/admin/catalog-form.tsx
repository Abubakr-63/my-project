"use client";

import { AddIcon, DeleteIcon, MinusIcon, SaveIcon } from "@/components/ui/icons";
import { Message } from "@/components/ui/message";
import { ui } from "@/components/ui/styles";
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

  const ActionIcon = { delete: DeleteIcon, activate: AddIcon, deactivate: MinusIcon, saveCatalog: SaveIcon }[label];
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
        className={label === "delete" ? ui.danger : ui.secondary}>
        <ActionIcon size={18} />{t(pending ? "saving" : label)}
      </button>
      {!pending && result?.ok && <Message tone="success">{t("catalogSaved")}</Message>}
      {!pending && result && !result.ok && <p role="alert" className="text-sm text-error">{t(result.error)}</p>}
    </form>
  );
}
